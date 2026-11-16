import styled from 'styled-components';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

export const CondicaoCard = styled(Paper)`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 0 !important;
  background: linear-gradient(145deg, rgba(9, 14, 26, 0.98), rgba(15, 23, 42, 0.96)) !important;
  border: 1px solid rgba(96, 165, 250, 0.18) !important;
  border-radius: 20px !important;
  box-shadow: 0 18px 32px rgba(2, 6, 23, 0.24) !important;
  transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease !important;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(140deg, rgba(59, 130, 246, 0.05), transparent 38%, rgba(234, 179, 8, 0.05));
    pointer-events: none;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(96, 165, 250, 0.32) !important;
    box-shadow: 0 24px 42px rgba(2, 6, 23, 0.32) !important;
  }
`;

export const CondicaoCardInner = styled(Box)`
  position: relative;
  z-index: 1;
  display: flex;
  gap: 18px;
  align-items: stretch;
  padding: 18px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const CondicaoImageFrame = styled(Box)`
  position: relative;
  width: 148px;
  min-width: 148px;
  height: 148px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(8, 13, 23, 0.9));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  @media (max-width: 640px) {
    width: 100%;
    min-width: 100%;
    height: 210px;
  }
`;

export const CondicaoCardBody = styled(Box)`
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
`;

export const CondicaoHeaderRow = styled(Box)`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`;

export const CondicaoTitle = styled(Typography)`
  color: var(--text-primary) !important;
  font-weight: 800 !important;
  line-height: 1.2 !important;
  letter-spacing: -0.01em !important;
  word-break: break-word;
`;

export const CondicaoMetaRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

export const CondicaoMetaChip = styled(Box)`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(234, 179, 8, 0.28);
  color: var(--text-primary);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const CondicaoCardDescription = styled(Typography)`
  color: var(--text-secondary) !important;
  font-size: 0.92rem !important;
  line-height: 1.65 !important;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 4.7em;
  margin-top: 2px;
`;

export const CondicaoActions = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
`;

export const CondicaoActionButton = styled(IconButton)`
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid rgba(148, 163, 184, 0.18) !important;
  border-radius: 10px !important;
  width: 34px !important;
  height: 34px !important;
  min-width: 34px !important;
  padding: 0 !important;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease !important;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(96, 165, 250, 0.34) !important;
  }
`;
