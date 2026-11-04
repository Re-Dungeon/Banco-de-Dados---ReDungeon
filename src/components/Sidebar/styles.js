import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';

export const SidebarWrapper = styled.aside`
  width: var(--sidebar-width);
  height: 100vh;
  background: linear-gradient(135deg, rgba(7, 13, 27, 0.98) 0%, rgba(11, 17, 31, 0.96) 100%);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(96, 165, 250, 0.12);
  box-shadow: inset -1px 0 0 rgba(111, 45, 168, 0.24);
  position: relative;
  z-index: 100;
  flex-shrink: 0;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1200;
    transform: translateX(${({ $open }) => ($open ? '0' : '-100%')});
    transition: transform var(--transition-normal);
  }
`;

export const SidebarOverlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(5, 8, 22, 0.62);
    z-index: 1100;
  }
`;

export const LogoSection = styled(Box)`
  padding: 18px 18px 16px;
  border-bottom: 1px solid rgba(96, 165, 250, 0.1);
  background: linear-gradient(
    180deg,
    rgba(111, 45, 168, 0.08) 0%,
    rgba(0, 217, 255, 0.03) 100%
  );
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const LogoImage = styled(Box)`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(111, 45, 168, 0.9) 0%, rgba(0, 217, 255, 0.75) 100%);
  color: #f8fafc;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 0 18px rgba(96, 165, 250, 0.38);
`;

export const GroupSection = styled(Box)`
  padding: 0 8px;
`;

export const SectionButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px 8px 8px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: rgba(96, 165, 250, 0.05);
    border-color: rgba(96, 165, 250, 0.08);
    color: var(--text-primary);
  }
`;

export const SectionTitle = styled.span`
  font-size: 0.68rem;
  line-height: 1.2;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
  color: inherit;
`;

export const SectionChevron = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transform: ${({ $expanded }) => ($expanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform var(--transition-fast);
`;

export const SectionItems = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 3px 0 6px 0;
`;

export const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;

  &.active .nav-item-btn {
    background: rgba(111, 45, 168, 0.22);
    border: 1px solid rgba(96, 165, 250, 0.18);
    box-shadow: inset 2px 0 0 var(--color-accent);
    color: var(--text-primary);

    .MuiListItemIcon-root {
      color: var(--color-accent);
    }
    .MuiListItemText-primary {
      color: var(--text-primary);
      font-weight: 600;
    }
  }
`;

export const NavItemButton = styled(ListItemButton)`
  border-radius: 10px !important;
  margin: 2px 0 !important;
  width: 100% !important;
  min-height: 32px !important;
  color: var(--text-secondary) !important;
  transition: all var(--transition-fast) !important;
  padding: 8px 10px 8px 12px !important;
  border: 1px solid transparent !important;

  &:hover {
    background: rgba(96, 165, 250, 0.06) !important;
    color: var(--text-primary) !important;

    .MuiListItemIcon-root {
      color: var(--color-accent);
    }
  }

  .MuiListItemIcon-root {
    min-width: 26px;
    color: var(--text-muted);
    transition: color var(--transition-fast);
    margin-right: 2px;

    svg {
      font-size: 1.05rem;
    }
  }

  .MuiListItemText-root {
    margin: 0;
  }

  .MuiListItemText-primary {
    color: inherit;
    font-size: 0.9rem;
    line-height: 1.2;
    letter-spacing: 0.01em;
  }
`;

