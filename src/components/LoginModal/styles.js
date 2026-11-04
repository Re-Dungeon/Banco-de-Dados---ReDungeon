import styled from 'styled-components';
import { styled as muiStyled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: linear-gradient(180deg, rgba(5, 8, 22, 0.96) 0%, rgba(11, 16, 32, 0.97) 100%) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(148, 163, 184, 0.16) !important;
    border-radius: 28px !important;
    min-width: 380px;
    max-width: 440px;
    width: min(90vw, 440px) !important;
    box-shadow: 0 28px 80px rgba(2, 6, 23, 0.9), 0 14px 36px rgba(96, 165, 250, 0.08) !important;
    position: relative;
    overflow: hidden !important;
    padding: 0 !important;
    transition: transform 0.2s ease, opacity 0.2s ease !important;

    &::before {
      content: '';
      position: absolute;
      inset: -15% 15% auto 15%;
      height: 220px;
      background: radial-gradient(circle at center, rgba(96, 165, 250, 0.12), rgba(59, 130, 246, 0.04) 28%, transparent 68%);
      filter: blur(28px);
      pointer-events: none;
      z-index: 0;
    }

    &::after {
      content: '';
      position: absolute;
      left: 18px;
      right: 18px;
      top: 10px;
      height: 2px;
      background: linear-gradient(90deg, rgba(124, 77, 255, 0) 0%, rgba(124, 77, 255, 0.3) 50%, rgba(59, 130, 246, 0.18) 100%);
      border-radius: 999px;
      z-index: 1;
      opacity: 0.9;
      pointer-events: none;
    }
  }
`;

export const StyledDialogContent = styled(DialogContent)`
  padding: 24px 24px 26px !important;
  display: flex;
  flex-direction: column;
  gap: 22px;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  overflow: hidden;
  align-items: stretch;

  & > .MuiBox-root:first-child {
    position: absolute;
    right: 14px;
    top: 14px;
    margin: 0 !important;
    z-index: 3;
  }

  & > form {
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .MuiFormControl-root {
    width: 100%;
    box-sizing: border-box;
    margin: 0;
  }

  .MuiFormControl-root:nth-of-type(1) .MuiOutlinedInput-root,
  .MuiFormControl-root:nth-of-type(2) .MuiOutlinedInput-root {
    position: relative;
    padding-left: 46px;
    display: flex;
    align-items: center;
  }

  .MuiFormControl-root:nth-of-type(1) .MuiOutlinedInput-root::before,
  .MuiFormControl-root:nth-of-type(2) .MuiOutlinedInput-root::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 50%;
    width: 18px;
    height: 18px;
    transform: translateY(-50%);
    pointer-events: none;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .MuiFormControl-root:nth-of-type(1) .MuiOutlinedInput-root::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M4 7.5C4 6.39543 4.89543 5.5 6 5.5H18C19.1046 5.5 20 6.39543 20 7.5V16.5C20 17.6046 19.1046 18.5 18 18.5H6C4.89543 18.5 4 17.6046 4 16.5V7.5Z' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M4.5 7L12 12.5L19.5 7' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  }

  .MuiFormControl-root:nth-of-type(2) .MuiOutlinedInput-root::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Crect x='4.5' y='10.5' width='15' height='9' rx='2' stroke='%2394A3B8' stroke-width='1.5'/%3E%3Cpath d='M8 10.5V8.5C8 6.567 9.567 5 11.5 5H12.5C14.433 5 16 6.567 16 8.5V10.5' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  }

  .MuiFormHelperText-root,
  .ErrorAlert,
  .MuiButton-root {
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 480px) {
    padding: 20px 18px 22px !important;
  }
`;

export const ModalTitle = styled(Typography)`
  color: #e2e8f0 !important;
  font-weight: 700 !important;
  font-size: clamp(2rem, 4vw, 2.6rem) !important;
  letter-spacing: -0.04em;
  line-height: 1.1;
  text-align: center;
  margin: 0 !important;
`;

export const ModalSubtitle = styled(Typography)`
  color: rgba(148, 163, 184, 0.96) !important;
  font-size: 0.92rem !important;
  text-align: center;
  margin: 0 !important;
  max-width: 320px;
  line-height: 1.5;
`;

export const StyledTextField = muiStyled(TextField)(() => ({
  width: '100%',
  maxWidth: '100%',
  '& .MuiOutlinedInput-root': {
    color: 'var(--text-primary)',
    background: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    minHeight: 56,
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    paddingLeft: 48,
    display: 'flex',
    alignItems: 'center',
    '& fieldset': {
      borderColor: 'transparent',
      borderWidth: 0,
    },
    '&:hover': {
      borderColor: 'rgba(96, 165, 250, 0.24)',
      boxShadow: '0 0 0 1px rgba(96,165,250,0.15)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(96, 165, 250, 0.18)',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 1px rgba(124, 58, 237, 0.38), 0 0 20px rgba(124, 58, 237, 0.12)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(124, 58, 237, 0.8)',
      borderWidth: 1,
    },
    '& input::placeholder': {
      color: '#94A3B8',
      opacity: 1,
    },
    '& .MuiInputBase-input': {
      height: 24,
      paddingTop: 14,
      paddingBottom: 14,
      boxSizing: 'border-box',
      fontSize: '0.96rem',
      paddingLeft: 0,
      marginLeft: 0,
      lineHeight: 1.4,
    },
  },
  '& .MuiInputLabel-root': {
    color: '#94A3B8',
    fontSize: '0.9rem',
    '&.Mui-focused': {
      color: '#E2E8F0',
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#f87171',
    marginLeft: 0,
    marginTop: 8,
    fontSize: '0.76rem',
  },
  '@media (max-width:480px)': {
    '& .MuiOutlinedInput-root': {
      minHeight: 52,
      paddingLeft: 44,
      '& .MuiInputBase-input': { fontSize: '0.94rem' },
    },
  },
}));

export const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.95) 0%, rgba(59, 130, 246, 0.88) 100%) !important;
  color: #f8fafc !important;
  height: 54px !important;
  padding: 0 20px !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  border-radius: 14px !important;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease !important;
  width: 100% !important;
  box-sizing: border-box !important;
  display: block !important;
  border: 1px solid rgba(148, 163, 184, 0.14) !important;
  box-shadow: 0 12px 30px rgba(124, 58, 237, 0.22) !important;

  &:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 16px 34px rgba(124, 58, 237, 0.28) !important;
    filter: brightness(1.03) !important;
  }

  &:active {
    transform: translateY(0) scale(0.998) !important;
  }

  &:disabled {
    opacity: 0.7 !important;
    box-shadow: none !important;
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
