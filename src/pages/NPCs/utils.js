import * as Yup from "yup";

export const NPC_SCHEMA = Yup.object({
  nome: Yup.string()
    .required("Nome é obrigatório")
    .min(2, "Mínimo 2 caracteres"),
  raca: Yup.string().required("Raça é obrigatória"),
  classe: Yup.string().required("Classe é obrigatória"),
  descricao: Yup.string().max(500, "Máximo 500 caracteres"),
});
