import styled from "styled-components";
import Paper from "@mui/material/Paper";

export const NPCCard = styled(Paper)`
  padding: 16px;
  background: var(--bg-card) !important;
  border: 1px solid var(--border-primary) !important;
  border-radius: 12px !important;
  transition: all 0.25s ease !important;

  &:hover {
    border-color: var(--border-hover) !important;
    box-shadow: var(--shadow-md) !important;
    transform: translateY(-2px);
  }
`;
