import styled from 'styled-components';
import { styled as muiStyled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: linear-gradient(180deg, #050816 0%, #0B1220 100%) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(59, 130, 246, 0.14) !important;
    border-radius: 24px !important;
    min-width: 380px;
    max-width: 420px;
    box-shadow: 0 28px 80px rgba(2, 6, 23, 0.75), 0 12px 34px rgba(59,130,246,0.06) !important;
    position: relative;
    overflow: hidden !important;
    padding: 0 !important;

    /* subtile radial glow behind modal */
    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: -48px;
      transform: translateX(-50%);
      width: 420px;
      height: 260px;
      background: radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 30%, transparent 60%);
      filter: blur(28px);
      pointer-events: none;
      z-index: 0;
    }

    /* thin decorative top line */
    &::after {
      content: '';
      position: absolute;
      left: 12px;
      right: 12px;
      top: 6px;
      height: 3px;
      background: linear-gradient(90deg, rgba(124,77,255,0) 0%, rgba(124,77,255,0.18) 50%, rgba(59,130,246,0.12) 100%);
      border-radius: 6px;
      z-index: 1;
      opacity: 0.9;
      pointer-events: none;
    }

    /* close button smaller + hover effect */
    .MuiDialogContent-root .MuiIconButton-root {
      width: 28px !important;
      height: 28px !important;
      color: rgba(255,255,255,0.6) !important;
      transition: color 0.18s ease, background 0.18s ease !important;
    }

    .MuiDialogContent-root .MuiIconButton-root:hover {
      color: #3B82F6 !important;
      background: rgba(59,130,246,0.06) !important;
    }
  }
`;

export const StyledDialogContent = styled(DialogContent)`
  padding: 32px !important;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  overflow: hidden;
  align-items: stretch;
  /* posiciona o box do close button fora do fluxo para não alterar layout */
  & > .MuiBox-root:first-child {
    position: absolute;
    right: 12px;
    top: 12px;
    margin: 0 !important;
    z-index: 3;
  }

  /* garantir que o form ocupe o espaço interno corretamente */
  & > form {
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  /* icons inside inputs via background images (avoid forwarding props) */
  .MuiFormControl-root {
    width: 100%;
    box-sizing: border-box;
    margin: 0;
  }

  .MuiFormControl-root:nth-of-type(1) .MuiOutlinedInput-root,
  .MuiFormControl-root:nth-of-type(2) .MuiOutlinedInput-root {
    position: relative;
    padding-left: 46px;
    width: 100%;
    box-sizing: border-box;
  }

  /* garantir que helper text, alerts e botão sigam a largura do form */
  .MuiFormHelperText-root,
  .ErrorAlert,
  .MuiButton-root {
    width: 100%;
    box-sizing: border-box;
  }
  .MuiFormControl-root:nth-of-type(1) .MuiOutlinedInput-root::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0%200%2024%2024'><path d='M20%204H4C2.9%204%202%204.9%202%206V18C2%2019.1%202.9%2020%204%2020H20C21.1%2020%2022%2019.1%2022%2018V6C22%204.9%2021.1%204%2020%204Z' stroke='%2394A3B8' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round' fill='none'/><path d='M22%206L12%2013L2%206' stroke='%2394A3B8' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>") no-repeat center/contain;
    pointer-events: none;
  }

  .MuiFormControl-root:nth-of-type(2) .MuiOutlinedInput-root {
    position: relative;
    padding-left: 46px;
    width: 100%;
    box-sizing: border-box;
  }
  .MuiFormControl-root:nth-of-type(2) .MuiOutlinedInput-root::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0%200%2024%2024'><rect x='3' y='11' width='18' height='10' rx='2' stroke='%2394A3B8' stroke-width='1.2' fill='none'/><path d='M7%2011V8C7%205.79086%208.79086%204%2011%204C13.2091%204%2015%205.79086%2015%208V11' stroke='%2394A3B8' stroke-width='1.2' stroke-linecap='round' fill='none'/></svg>") no-repeat center/contain;
    pointer-events: none;
  }
`;

export const ModalTitle = styled(Typography)`
  color: #E6EEF8 !important;
  font-weight: 700 !important;
  font-size: 32px !important;
  text-align: center;
  margin-top: 12px !important;
  letter-spacing: -0.02em;
`;

export const ModalSubtitle = styled(Typography)`
  color: #94A3B8 !important;
  font-size: 0.95rem !important;
  text-align: center;
  margin-top: -4px !important;
  max-width: 360px;
`;

export const StyledTextField = muiStyled(TextField)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  '& .MuiOutlinedInput-root': {
    color: 'var(--text-primary)',
    background: 'rgba(59, 130, 246, 0.18)',
    borderRadius: 12,
    height: 52,
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    '& fieldset': {
      borderColor: 'transparent',
      borderWidth: 1,
    },
    '&:hover fieldset': {
      borderColor: 'rgba(59,130,246,0.06)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3B82F6',
      boxShadow: '0 8px 32px rgba(59,130,246,0.12)',
    },
    '& input::placeholder': {
      color: '#CBD5E1',
      opacity: 1,
    },
    '& .MuiInputBase-input': {
      height: 52,
      paddingTop: 14,
      paddingBottom: 14,
      boxSizing: 'border-box',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#94A3B8',
    '&.Mui-focused': {
      color: '#E6EEF8',
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#f87171',
  },
  /* adornment/icon color */
  '& .MuiInputAdornment-root svg path, & .MuiInputAdornment-root svg rect': {
    stroke: '#94A3B8',
  },
  /* responsive */
  ['@media (max-width:480px)']: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      height: 48,
      '& .MuiInputBase-input': { height: 48, paddingTop: 12, paddingBottom: 12 },
    },
  },
}));

export const SubmitButton = styled(Button)`
  background: linear-gradient(90deg, #7C3AED 0%, #9333EA 100%) !important;
  color: #fff !important;
  height: 52px !important;
  padding: 0 20px !important;
  font-weight: 600 !important;
  font-size: 0.95rem !important;
  border-radius: 12px !important;
  transition: transform 0.18s ease, box-shadow 0.18s ease !important;
  width: 100% !important;
  box-sizing: border-box !important;
  display: block !important;

  &:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 12px 36px rgba(147,51,234,0.18) !important;
  }

  &:active {
    transform: translateY(0) scale(0.998) !important;
  }

  &:disabled {
    opacity: 0.6 !important;
  }
`;

export const GoogleButton = styled(Button)`
  border: 1px solid var(--border-primary) !important;
  color: var(--text-secondary) !important;
  background: transparent !important;
  padding: 10px !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;

  &:hover {
    border-color: var(--border-hover) !important;
    background: rgba(255, 255, 255, 0.04) !important;
    color: var(--text-primary) !important;
  }
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
  font-size: 0.8rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-primary);
  }
`;

export const ToggleText = styled(Typography)`
  text-align: center;
  color: var(--text-muted) !important;
  font-size: 0.85rem !important;

  span {
    color: var(--color-accent) !important;
    cursor: pointer;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const ErrorAlert = styled.div`
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  color: #f87171;
  font-size: 0.85rem;
  text-align: center;
`;
