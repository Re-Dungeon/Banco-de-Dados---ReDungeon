import styled from 'styled-components';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const RacaFormPanel = styled(Paper)`
  padding: 32px !important;
  background: linear-gradient(145deg, rgba(23, 32, 51, 0.98), rgba(15, 23, 42, 0.96)) !important;
  border: 1px solid rgba(43, 57, 85, 0.95) !important;
  border-radius: 24px !important;
  box-shadow: 0 18px 40px rgba(2, 6, 23, 0.35) !important;
  backdrop-filter: blur(16px);

  @media (max-width: 900px) {
    padding: 24px !important;
  }
`;

export const RacaFormHeader = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

export const RacaFormTitle = styled(Typography)`
  color: #29b6f6 !important;
  font-weight: 700 !important;
  font-size: 1.65rem !important;
  letter-spacing: 0.02em !important;
`;

export const RacaFormSubtitle = styled(Typography)`
  color: var(--text-secondary) !important;
  font-size: 0.95rem !important;
  line-height: 1.6 !important;
`;

export const RacaFormDivider = styled(Box)`
  width: 100%;
  height: 1px;
  margin-top: 8px;
  background: linear-gradient(90deg, rgba(41, 182, 246, 0.35), rgba(124, 77, 255, 0.12));
`;

export const RacaFormContentGrid = styled(Box)`
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
  gap: 28px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const RacaFormFieldColumn = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const RacaFormFieldGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const AtributosCard = styled(Paper)`
  padding: 28px !important;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.96)) !important;
  border: 1px solid rgba(59, 130, 246, 0.18) !important;
  border-radius: 18px !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02), 0 18px 40px rgba(0, 0, 0, 0.24) !important;
`;

export const AtributosHeader = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 22px;
`;

export const AtributosHeaderRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const AtributosHeaderLine = styled(Box)`
  width: 92px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.95), rgba(59, 130, 246, 0.45));
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.18);
`;

export const AtributosGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const AtributoTitle = styled(Typography)`
  color: #cbd5e1 !important;
  font-size: 0.85rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.04em !important;
  text-transform: none !important;
`;

export const AtributoValue = styled(Typography)`
  color: #ffffff !important;
  font-weight: 600 !important;
  font-size: 1.15rem !important;
`;

export const RacaFormPreviewCard = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid rgba(41, 182, 246, 0.3);
  background: linear-gradient(145deg, rgba(12, 20, 36, 0.96), rgba(15, 23, 42, 0.9));
  box-shadow: 0 16px 38px rgba(2, 6, 23, 0.35);
`;

export const RacaFormPreviewImage = styled(Box)`
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(124, 77, 255, 0.25);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(22, 33, 54, 0.92));
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);

  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 12px 28px rgba(41, 182, 246, 0.12);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform var(--transition-normal), filter var(--transition-normal);
  }

  &:hover img {
    transform: scale(1.03);
    filter: brightness(1.04) saturate(1.04);
  }
`;

export const RacaCard = styled(Paper)`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 480px;
  padding: 0 !important;
  background: linear-gradient(
    145deg,
    rgba(16, 24, 43, 0.96),
    rgba(5, 8, 20, 0.94)
  ) !important;
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
    background: linear-gradient(
      140deg,
      rgba(0, 217, 255, 0.08),
      transparent 45%,
      rgba(111, 45, 168, 0.08)
    );
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

  &:hover .raca-card-image {
    transform: scale(1.03);
    filter: brightness(1.04) saturate(1.04);
  }
`;

export const RacaModalHeader = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 18px 0 24px;
  border-bottom: 1px solid rgba(96, 165, 250, 0.12);
  text-align: center;
`;

export const RacaModalHeroBadges = styled(Box)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
`;

export const RacaModalBadge = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(96, 165, 250, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
  font-size: 0.86rem;
  font-weight: 600;
`;

export const RacaModalImage = styled(Box)`
  width: 100%;
  height: 260px;
  min-height: 260px;
  max-height: 260px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.16);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.22);
  transition: transform var(--transition-normal), filter var(--transition-normal);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1);
    transition: transform var(--transition-normal), filter var(--transition-normal);
  }

  &:hover {
    transform: translateY(-2px);
  }

  &:hover img {
    transform: scale(1.02);
    filter: brightness(1.05);
  }
`;

export const RacaDescriptionPanel = styled(Box)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(96, 165, 250, 0.1);
  border-radius: 22px;
  padding: 22px;
  margin: 22px 0;
  line-height: 1.8;
`;

export const RacaSectionTitle = styled(Typography)`
  color: var(--color-accent) !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.14em !important;
  font-size: 0.75rem !important;
  margin-bottom: 16px !important;
`;

export const RacaAttributeGrid = styled(Box)`
  display: grid;
  /* Mostrar 6 atributos por linha em telas grandes */
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-top: 8px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const RacaAttributeCard = styled(Box)`
  background: rgba(2, 8, 23, 0.9);
  border: 1px solid rgba(96, 165, 250, 0.12);
  border-radius: 12px;
  padding: 12px 10px;
  text-align: center;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(96, 165, 250, 0.22);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.18);
  }
`;

export const RacaAttributeLabel = styled(Typography)`
  color: var(--text-muted) !important;
  font-size: 0.68rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
`;

export const RacaAttributeValue = styled(Typography)`
  color: var(--text-primary) !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  margin-top: 6px !important;
  line-height: 1 !important;
`;

export const RacaAbilityList = styled(Box)`
  display: grid;
  gap: 16px;
  margin-top: 10px;
`;

export const RacaAbilityCard = styled(Box)`
  background: linear-gradient(180deg, rgba(6,10,20,0.92), rgba(2,6,16,0.98));
  border: 1px solid rgba(96, 165, 250, 0.10);
  border-radius: 20px;
  padding: 28px;
  height: 360px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 30px 50px rgba(0, 0, 0, 0.36);
    border-color: rgba(96, 165, 250, 0.18);
  }
`;

export const RacaAbilityHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const RacaAbilityTitle = styled(Typography)`
  color: #ffffff !important;
  font-weight: 800 !important;
  font-size: 30px !important;
`;

export const RacaAbilityLabel = styled(Typography)`
  color: var(--text-secondary) !important;
  font-weight: 600 !important;
  font-size: 15px !important;
  white-space: nowrap;
`;

export const AbilityHeaderCore = styled(Typography)`
  color: var(--text-secondary) !important;
  font-size: 15px !important;
  margin-top: 6px;
`;

export const AbilityBadge = styled(Box)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
`;

export const AbilityStatsBar = styled(Box)`
  display: flex;
  gap: 8px;
  margin-top: 14px;
`;

export const AbilityStat = styled(Box)`
  flex: 1 1 0;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(96,165,250,0.06);
  border-radius: 10px;
  padding: 8px 10px;
  text-align: center;
`;

export const AbilityStatLabel = styled(Typography)`
  color: var(--text-muted) !important;
  font-size: 12px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.12em !important;
`;

export const AbilityStatValue = styled(Typography)`
  color: var(--text-primary) !important;
  font-weight: 600 !important;
  font-size: 18px !important;
  margin-top: 6px !important;
`;

export const AbilityTabNav = styled(Box)`
  display: flex;
  gap: 10px;
  margin-top: 16px;
`;

export const AbilityTabButton = styled(Box)`
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  transition: all 180ms ease;
  color: var(--text-muted);
  background: transparent;

  &.active {
    background: linear-gradient(90deg, rgba(96,165,250,0.08), rgba(255,215,64,0.03));
    color: #fff;
    border: 1px solid rgba(96,165,250,0.12);
    box-shadow: 0 8px 18px rgba(0,0,0,0.35);
  }
`;

export const AbilityContentArea = styled(Box)`
  margin-top: 12px;
  height: 220px;
  overflow: auto;
  padding-right: 6px;
`;

export const AbilityBonusItem = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(96,165,250,0.06);
  color: var(--text-secondary);
  font-size: 14px;
  margin: 8px 8px 0 0;
`;

export const RacaAbilityDescription = styled(Typography)`
  color: var(--text-secondary) !important;
  margin: 12px 0 0 !important;
  line-height: 1.7 !important;
`;

export const RacaAbilityMeta = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

export const RacaAbilityBadge = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(96, 165, 250, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
`;

export const RacaImageFrame = styled(Box)`
  position: relative;
  height: 230px;
  overflow: hidden;
  background: rgba(2, 8, 23, 0.75);
  border-bottom: 1px solid rgba(96, 165, 250, 0.14);

  .raca-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform var(--transition-normal), filter var(--transition-normal);
  }
`;

export const RacaImageOverlay = styled(Box)`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(3, 7, 18, 0.08) 0%,
    rgba(2, 6, 23, 0.6) 100%
  );
  pointer-events: none;
`;

export const RacaActionBar = styled(Box)`
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  /* Fundo semi-transparente ~80% (preserva opacidade dos ícones) */
  background: rgba(3, 10, 23, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
`;

export const RacaContent = styled(Box)`
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 20px 20px 18px;
  gap: 8px;
`;

export const RacaTitle = styled(Typography)`
  color: var(--text-primary) !important;
  font-weight: 700 !important;
  line-height: 1.2 !important;
  letter-spacing: 0.01em !important;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RacaSubtitle = styled(Typography)`
  color: var(--color-accent) !important;
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase;
  opacity: 0.95;
`;

export const RacaDescription = styled(Typography)`
  color: var(--text-secondary) !important;
  font-size: 0.92rem !important;
  line-height: 1.55 !important;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 4.65em;
`;

export const RacaFooter = styled(Box)`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(96, 165, 250, 0.14);
`;

export const RacaMeta = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const RacaBadge = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(11, 16, 32, 0.74);
  border: 1px solid rgba(96, 165, 250, 0.16);
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
`;
