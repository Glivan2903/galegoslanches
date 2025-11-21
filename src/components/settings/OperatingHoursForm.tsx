import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Save, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { Database } from "@/integrations/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type BusinessHour = Database["public"]["Tables"]["business_hours"]["Row"];

type LocalBusinessHour = BusinessHour & {
  isDirty?: boolean;
};

const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

const PRESET_HOURS = [
  { label: "Comercial (9h às 18h)", open: "09:00", close: "18:00" },
  { label: "Estendido (8h às 22h)", open: "08:00", close: "22:00" },
  { label: "Noturno (18h às 02h)", open: "18:00", close: "02:00" },
  { label: "Madrugada (22h às 06h)", open: "22:00", close: "06:00" },
  { label: "24 horas", open: "00:00", close: "23:59" },
  { label: "Personalizado", open: "", close: "" },
];

export function OperatingHoursForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showCustomOption, setShowCustomOption] = useState(false);
  const [localBusinessHours, setLocalBusinessHours] = useState<
    LocalBusinessHour[]
  >([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: businessHours, refetch } = useQuery({
    queryKey: ["business_hours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_hours")
        .select("*")
        .order("id");

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar horários",
          description: error.message,
        });
        return [];
      }

      // Se não existirem horários, criar um para cada dia da semana
      if (!data || data.length === 0) {
        const defaultHours = DAYS_OF_WEEK.map((day) => ({
          day_of_week: day,
          open_time: "09:00",
          close_time: "18:00",
          is_closed: day === "Domingo",
        }));

        const { error: insertError } = await supabase
          .from("business_hours")
          .insert(defaultHours);

        if (insertError) {
          toast({
            variant: "destructive",
            title: "Erro ao criar horários padrão",
            description: insertError.message,
          });
          return [];
        }

        const { data: newData } = await supabase
          .from("business_hours")
          .select("*")
          .order("id");

        return newData || [];
      }

      return data;
    },
  });

  // Atualiza o estado local quando os dados são carregados
  useEffect(() => {
    if (businessHours) {
      setLocalBusinessHours(
        businessHours.map((hour) => ({ ...hour, isDirty: false }))
      );
    }
  }, [businessHours]);

  const handleLocalTimeChange = (
    id: string,
    field: "open_time" | "close_time",
    value: string
  ) => {
    const updatedHours = localBusinessHours.map((hour) => {
      if (hour.id === id) {
        return { ...hour, [field]: value, isDirty: true };
      }
      return hour;
    });

    setLocalBusinessHours(updatedHours);
    setHasChanges(true);
  };

  const handleToggleDay = async (id: string, is_closed: boolean) => {
    const updatedHours = localBusinessHours.map((hour) => {
      if (hour.id === id) {
        return { ...hour, is_closed, isDirty: true };
      }
      return hour;
    });

    setLocalBusinessHours(updatedHours);
    setHasChanges(true);
  };

  // Função para notificar outras páginas sobre a alteração
  const notifyBusinessHoursChanged = () => {
    // Define uma flag no localStorage para indicar que os horários foram alterados
    localStorage.setItem("businessHoursChanged", "true");

    // Dispara um evento personalizado para notificar outros componentes
    const event = new StorageEvent("storage", {
      key: "businessHoursChanged",
      newValue: "true",
      storageArea: localStorage,
    });

    // Despacha o evento para outras abas/janelas
    window.dispatchEvent(event);
  };

  const saveChanges = async () => {
    setIsSubmitting(true);

    try {
      // Filtra apenas os horários que foram modificados
      const changedHours = localBusinessHours.filter((hour) => hour.isDirty);

      if (changedHours.length === 0) {
        toast({
          title: "Informação",
          description: "Não há alterações para salvar.",
        });
        setIsSubmitting(false);
        return;
      }

      // Atualiza cada registro modificado no banco de dados
      for (const hour of changedHours) {
        const { error } = await supabase
          .from("business_hours")
          .update({
            open_time: hour.open_time,
            close_time: hour.close_time,
            is_closed: hour.is_closed,
            updated_at: new Date().toISOString(),
          })
          .eq("id", hour.id);

        if (error) throw error;
      }

      // Marca todos como não modificados
      setLocalBusinessHours(
        localBusinessHours.map((hour) => ({ ...hour, isDirty: false }))
      );
      setHasChanges(false);

      // Notifica outras páginas sobre a alteração
      notifyBusinessHoursChanged();

      // Atualiza o cache no localStorage
      const updatedData = await refetch();
      if (updatedData.data) {
        localStorage.setItem("businessHours", JSON.stringify(updatedData.data));
        localStorage.setItem("businessHoursLastUpdate", Date.now().toString());
      }

      toast({
        title: "Sucesso",
        description: "Horários atualizados com sucesso.",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao salvar horários",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPresetToAll = (presetIndex: number) => {
    if (presetIndex < 0 || presetIndex >= PRESET_HOURS.length) return;

    const preset = PRESET_HOURS[presetIndex];

    // Se for a opção personalizada, não aplicamos nada, apenas habilitamos a edição manual
    if (presetIndex === PRESET_HOURS.length - 1) {
      setShowCustomOption(true);
      setSelectedPreset("Personalizado");
      return;
    } else {
      setShowCustomOption(false);
    }

    // Atualiza o estado local com os horários do preset
    const updatedHours = localBusinessHours.map((hour) => ({
      ...hour,
      open_time: preset.open,
      close_time: preset.close,
      isDirty: true,
    }));

    setLocalBusinessHours(updatedHours);
    setHasChanges(true);

    toast({
      title: "Horários alterados",
      description: `Horário ${preset.label} aplicado. Clique em Salvar para confirmar.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários de Funcionamento</CardTitle>
        <CardDescription>
          Configure os horários de funcionamento do seu estabelecimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Aplicar horário padrão
            </label>
            <div className="flex items-center gap-4">
              <Select
                value={selectedPreset || ""}
                onValueChange={(value) => {
                  setSelectedPreset(value);
                  const presetIndex = PRESET_HOURS.findIndex(
                    (p) => p.label === value
                  );
                  if (presetIndex !== -1) {
                    applyPresetToAll(presetIndex);
                  }
                }}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Selecione um horário padrão" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_HOURS.map((preset, index) => (
                    <SelectItem key={index} value={preset.label}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {localBusinessHours.map((dayHours) => {
              const day = dayHours.day_of_week;
              return (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-32">
                    <span>{day}</span>
                    {dayHours.isDirty && (
                      <span className="ml-2 text-xs text-amber-500">*</span>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        type="time"
                        value={dayHours.open_time?.slice(0, 5) || ""}
                        onChange={(e) =>
                          handleLocalTimeChange(
                            dayHours.id,
                            "open_time",
                            e.target.value
                          )
                        }
                        disabled={
                          dayHours.is_closed ||
                          (!showCustomOption &&
                            selectedPreset !== "Personalizado")
                        }
                      />
                      <Clock className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>

                    <div className="relative">
                      <Input
                        type="time"
                        value={dayHours.close_time?.slice(0, 5) || ""}
                        onChange={(e) =>
                          handleLocalTimeChange(
                            dayHours.id,
                            "close_time",
                            e.target.value
                          )
                        }
                        disabled={
                          dayHours.is_closed ||
                          (!showCustomOption &&
                            selectedPreset !== "Personalizado")
                        }
                      />
                      <Clock className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!dayHours.is_closed}
                      onCheckedChange={(checked) =>
                        handleToggleDay(dayHours.id, !checked)
                      }
                    />
                    <span
                      className={
                        dayHours.is_closed ? "text-red-500" : "text-green-500"
                      }
                    >
                      {dayHours.is_closed ? "Fechado" : "Aberto"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {hasChanges && (
            <div className="flex justify-end">
              <Button
                onClick={saveChanges}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar alterações
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
