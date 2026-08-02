import styled, { keyframes } from 'styled-components';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const AptidaoCard = styled(Paper)`
  padding: 20px !important;
  background: var(--bg-card) !important;
  border: 1px solid var(--border-primary) !important;
  border-radius: 12px !important;
  transition: all 0.25s ease !important;

  &:hover {
    border-color: var(--border-hover) !important;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md) !important;
  }
`;

export const AptidaoViewBadge = styled(Box)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const AptidaoViewHeroInfo = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.92rem;
  line-height: 1.5;
`;

export const AptidaoDialogContentWrapper = styled(Box)`
  display: grid;
  gap: 20px;
  width: 100%;
  animation: ${fadeIn} 0.36s ease both;
`;

export const AptidaoSectionGrid = styled(Box)`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
  width: 100%;

  @media (min-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const AptidaoSectionCard = styled(Paper)`
  padding: 22px !important;
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18) !important;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease !important;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 217, 255, 0.18) !important;
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.24) !important;
  }
`;

export const AptidaoSectionHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.85rem;
`;

export const AptidaoSectionBody = styled(Box)`
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 0.96rem;
  white-space: pre-line;
`;
