import styled from 'styled-components';
import Paper from '@mui/material/Paper';

export const ArteCard = styled(Paper)`
  position: relative;
  height: 520px !important;
  min-height: 520px !important;
  max-height: 520px !important;
  /* Top padding reduced to bring title closer to card top */
  padding: 16px 24px 24px !important;
  display: flex !important;
  flex-direction: column !important;
  background: linear-gradient(180deg, rgba(10,15,25,0.92) 0%, rgba(7,10,18,0.96) 100%) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 18px !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.45) !important;
  backdrop-filter: blur(18px);
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease !important;
  overflow: hidden;

  &:hover {
    border-color: rgba(212,175,55,0.45) !important;
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.55), 0 0 24px rgba(212,175,55,0.08) !important;
  }

  /* Header (title + tags) adjustments */
  & > div > div:first-child {
    padding-top: 0 !important;
  }

  /* Make the title sit closer to the top and give breathing to tags */
  & h6 {
    margin-bottom: 6px !important;
    line-height: 1.05 !important;
  }

  /* Tag container sits under the title; increase vertical spacing */
  & h6 + div {
    margin-top: 6px !important;
    gap: 8px !important;
  }

  /* Tag (badge) styling: taller pills, rectangular with gentle rounding */
  & h6 + div > div {
    padding: 6px 12px !important;
    border-radius: 10px !important;
    background: rgba(91,124,250,0.10) !important;
    border: 1px solid rgba(91,124,250,0.22) !important;
    font-size: 0.78rem !important;
    letter-spacing: 0.06em !important;
    height: auto !important;
    align-items: center !important;
    display: inline-flex !important;
  }

  /* Attributes grid - increase horizontal breathing and make tiles rectangular */
  & > div > div:nth-child(2) {
    gap: 12px !important;
    min-height: 96px;
  }

  /* Individual attribute card */
  & > div > div:nth-child(2) > div {
    background: rgba(255,255,255,0.02) !important;
    border: 1px solid rgba(255,255,255,0.06) !important;
    border-radius: 12px !important;
    padding: 10px 12px !important;
    min-height: 64px !important; /* more wide than tall */
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 4px !important;
  }

  /* Attribute label (legend) - smaller, muted, letter-spaced */
  & > div > div:nth-child(2) > div .MuiTypography-caption {
    font-size: 11px !important;
    opacity: 0.75 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
  }

  /* Attribute value - prominent, larger and heavier */
  & > div > div:nth-child(2) > div .MuiTypography-subtitle2 {
    font-size: 14px !important;
    font-weight: 800 !important;
    color: var(--text-primary) !important;
  }
`;
