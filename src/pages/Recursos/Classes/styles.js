import styled from 'styled-components';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

// ClasseCard: visual parity with RacaCard (UI-only)
export const ClasseCard = styled(Paper)`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 480px;
  padding: 0 !important;
  background: linear-gradient(145deg, rgba(16, 24, 43, 0.96), rgba(5, 8, 20, 0.94)) !important;
  border: 1px solid var(--border-primary) !important;
  border-radius: 20px !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28) !important;
  backdrop-filter: blur(18px);
  transition:
    transform var(--transition-normal),
    border-color var(--transition-fast),
    box-shadow var(--transition-normal),
    filter var(--transition-normal);
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(140deg, rgba(0,217,255,0.06), transparent 45%, rgba(111,45,168,0.06));
    pointer-events: none;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: var(--border-hover) !important;
    box-shadow:
      0 0 0 1px rgba(0, 217, 255, 0.12),
      0 18px 40px rgba(0, 0, 0, 0.36),
      0 0 24px rgba(0, 217, 255, 0.12) !important;
  }

  /* Top action box (in Classes.jsx it's the first child Box) - make it overlay like Racas */
  & > div:first-of-type {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(3, 10, 23, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 999px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  }

  /* Image styling: support <img> placed directly inside the card */
  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
    transition: transform var(--transition-normal), filter var(--transition-normal);
    border-bottom: 1px solid rgba(96, 165, 250, 0.14);
  }

  &:hover img {
    transform: scale(1.03);
    filter: brightness(1.04) saturate(1.04);
  }

  /* Content area (texts) - ensure padding and spacing match Racas
     The first child is the action bar (absolute); apply padding to all
     other direct children so we don't need to change JSX structure. */
  & > *:not(:first-of-type) {
    position: relative;
    z-index: 1;
    padding: 20px 20px 18px;
    gap: 8px;
  }
`;

// Export a tiny helper Box-styled to be used optionally if the Classes pages want structure similar to Racas.
export const ClasseContent = styled(Box)`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 18px;
  gap: 8px;
`;
