import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useAuth } from 'context/AuthContext';
import LoginModal from 'components/LoginModal/LoginModal';

const decorativeTags = [
  {
    label: 'Personagens',
    icon: PeopleAltOutlinedIcon,
    glow: 'rgba(168, 85, 247, 0.38)',
    border: 'rgba(196, 181, 253, 0.52)',
    iconColor: '#d8b4fe',
  },
  {
    label: 'Regiões',
    icon: MapOutlinedIcon,
    glow: 'rgba(59, 130, 246, 0.36)',
    border: 'rgba(147, 197, 253, 0.52)',
    iconColor: '#bfdbfe',
  },
  {
    label: 'Classes',
    icon: ShieldOutlinedIcon,
    glow: 'rgba(168, 85, 247, 0.36)',
    border: 'rgba(196, 181, 253, 0.52)',
    iconColor: '#ddd6fe',
  },
  {
    label: 'Raças',
    icon: PetsOutlinedIcon,
    glow: 'rgba(34, 211, 238, 0.32)',
    border: 'rgba(125, 211, 252, 0.52)',
    iconColor: '#a5f3fc',
  },
  {
    label: 'Conhecimento Arcano',
    icon: MenuBookOutlinedIcon,
    glow: 'rgba(168, 85, 247, 0.34)',
    border: 'rgba(216, 180, 254, 0.5)',
    iconColor: '#e9d5ff',
  },
  {
    label: 'Divindades',
    icon: AutoAwesomeOutlinedIcon,
    glow: 'rgba(250, 204, 21, 0.24)',
    border: 'rgba(253, 224, 71, 0.48)',
    iconColor: '#fef3c7',
  },
];

const particles = [
  { left: '12%', top: '18%', size: 5, delay: '0s', opacity: 0.9 },
  { left: '24%', top: '42%', size: 7, delay: '2s', opacity: 0.7 },
  { left: '32%', top: '68%', size: 4, delay: '1.4s', opacity: 0.8 },
  { left: '48%', top: '16%', size: 6, delay: '3.2s', opacity: 0.85 },
  { left: '60%', top: '30%', size: 8, delay: '4.2s', opacity: 0.7 },
  { left: '72%', top: '52%', size: 5, delay: '2.5s', opacity: 0.8 },
  { left: '82%', top: '22%', size: 6, delay: '5s', opacity: 0.9 },
  { left: '88%', top: '64%', size: 5, delay: '1.8s', opacity: 0.75 },
  { left: '66%', top: '74%', size: 7, delay: '3.8s', opacity: 0.8 },
  { left: '18%', top: '76%', size: 4, delay: '4.4s', opacity: 0.72 },
  { left: '40%', top: '82%', size: 6, delay: '2.8s', opacity: 0.7 },
  { left: '54%', top: '88%', size: 5, delay: '5.6s', opacity: 0.8 },
];

const ProtectedRoute = () => {
  const { currentUser, loading, loadingPreferences } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoginClosing, setIsLoginClosing] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoginClosing(true);
    window.setTimeout(() => {
      setLoginModalOpen(false);
      setIsLoginClosing(false);
    }, 350);
  };

  const handleLoginModalClose = () => {
    setIsLoginClosing(false);
    setLoginModalOpen(false);
  };

  if (loading || (currentUser && loadingPreferences)) {
    return null;
  }

  if (!currentUser) {
    return (
      <>
        <Box
          className={isLoginClosing ? 'redungeon-access-shell redungeon-access-shell--closing' : 'redungeon-access-shell'}
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: '100dvh',
            height: '100dvh',
            overflow: 'hidden',
            backgroundColor: '#050816',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, md: 5 },
            transition: 'opacity 350ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <Box
            className="redungeon-access-backdrop"
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: "url('https://i.imgur.com/W8HrkQg.jpeg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              filter: 'saturate(1.05) contrast(1.08)',
              transform: 'scale(1.08)',
            }}
          />

          <Box
            className="redungeon-access-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(6, 10, 20, 0.72) 0%, rgba(10, 16, 30, 0.44) 28%, rgba(10, 16, 30, 0.34) 52%, rgba(6, 10, 20, 0.72) 100%), radial-gradient(circle at 18% 28%, rgba(111, 45, 168, 0.28), transparent 22%), radial-gradient(circle at 82% 26%, rgba(0, 217, 255, 0.2), transparent 20%), radial-gradient(circle at center, rgba(8, 13, 25, 0.12), rgba(2, 6, 23, 0.72) 68%, rgba(2, 6, 23, 0.8) 100%)',
            }}
          />

          <Box
            className="redungeon-access-glow redungeon-access-glow-left"
            sx={{
              position: 'absolute',
              left: '-12%',
              top: '12%',
              width: '42%',
              height: '56%',
              background: 'radial-gradient(circle, rgba(111, 45, 168, 0.34) 0%, transparent 68%)',
              filter: 'blur(18px)',
            }}
          />

          <Box
            className="redungeon-access-glow redungeon-access-glow-right"
            sx={{
              position: 'absolute',
              right: '-14%',
              bottom: '10%',
              width: '40%',
              height: '52%',
              background: 'radial-gradient(circle, rgba(0, 217, 255, 0.26) 0%, transparent 64%)',
              filter: 'blur(18px)',
            }}
          />

          <Box
            className="redungeon-access-fog"
            sx={{
              position: 'absolute',
              inset: 'auto 0 0 0',
              height: '34%',
              background:
                'linear-gradient(180deg, rgba(12, 20, 36, 0), rgba(27, 38, 57, 0.3), rgba(4, 8, 18, 0.82))',
            }}
          />

          {particles.map((particle, index) => (
            <Box
              key={`${particle.left}-${particle.top}-${index}`}
              className="redungeon-particle"
              sx={{
                position: 'absolute',
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                borderRadius: '50%',
                background: 'rgba(165, 180, 252, 0.9)',
                boxShadow: '0 0 12px rgba(96, 165, 250, 0.7), 0 0 22px rgba(168, 85, 247, 0.6)',
                opacity: particle.opacity,
                animationDelay: particle.delay,
              }}
            />
          ))}

          {decorativeTags.map((tag, index) => {
            const Icon = tag.icon;
            const positions = [
              { top: '11%', left: '9%' },
              { top: '13%', right: '9%' },
              { top: '41%', left: '6%' },
              { top: '43%', right: '7%' },
              { bottom: '18%', left: '22%' },
              { bottom: '17%', right: '22%' },
            ];

            return (
              <Box
                key={tag.label}
                className="redungeon-tag"
                sx={{
                  position: 'absolute',
                  ...positions[index],
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  minHeight: 42,
                  px: 1.3,
                  py: 0.75,
                  borderRadius: 999,
                  border: `1px solid ${tag.border}`,
                  background:
                    'linear-gradient(135deg, rgba(8, 14, 24, 0.76) 0%, rgba(15, 23, 42, 0.48) 100%)',
                  color: 'var(--text-primary)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  boxShadow: `0 0 0 1px rgba(15, 23, 42, 0.22), 0 14px 28px rgba(8, 15, 28, 0.28), 0 0 18px ${tag.glow}`,
                  backdropFilter: 'blur(12px)',
                  transition:
                    'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: tag.border,
                    boxShadow: `0 0 0 1px rgba(96,165,250,0.12), 0 18px 30px rgba(8,15,28,0.34), 0 0 28px ${tag.glow}`,
                    background:
                      'linear-gradient(135deg, rgba(10, 18, 31, 0.82) 0%, rgba(22, 32, 52, 0.58) 100%)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, rgba(15, 23, 42, 0.96), ${tag.glow})`,
                    border: `1px solid ${tag.border}`,
                    boxShadow: `inset 0 0 18px ${tag.glow}`,
                  }}
                >
                  <Icon sx={{ fontSize: 15, color: tag.iconColor }} />
                </Box>
                <Box component="span" sx={{ lineHeight: 1.2 }}>
                  {tag.label}
                </Box>
              </Box>
            );
          })}

          <Box
            className="redungeon-access-panel"
            sx={{
              position: 'relative',
              zIndex: 1,
              width: 'min(720px, 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.75,
              p: { xs: 3, md: 4 },
              borderRadius: 5,
              border: '1px solid rgba(96, 165, 250, 0.2)',
              background: 'rgba(8, 13, 25, 0.72)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 28px 80px rgba(2, 6, 23, 0.52), inset 0 0 0 1px rgba(96,165,250,0.08)',
              textAlign: 'center',
              minHeight: { xs: 'auto', md: '360px' },
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                letterSpacing: '0.12em',
                lineHeight: 1,
                color: 'var(--text-primary)',
                fontSize: { xs: '2rem', md: '4rem' },
                textShadow: '0 0 22px rgba(0, 217, 255, 0.25)',
              }}
            >
              REDUNGEON
            </Typography>

            <Box
              sx={{
                width: 90,
                height: 90,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3.5,
                background:
                  'linear-gradient(135deg, rgba(111, 45, 168, 0.9), rgba(0, 217, 255, 0.35))',
                border: '1px solid rgba(96, 165, 250, 0.28)',
                boxShadow: '0 16px 36px rgba(111, 45, 168, 0.28)',
                mt: 0.5,
              }}
            >
              <ShieldOutlinedIcon
                sx={{
                  fontSize: 42,
                  color: 'var(--text-primary)',
                  filter: 'drop-shadow(0 0 18px rgba(0,217,255, 0.5))',
                }}
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: { xs: '1.8rem', md: '2.5rem' },
              }}
            >
              Acesso Restrito
            </Typography>

            <Typography
              variant="body1"
              sx={{
                maxWidth: 520,
                color: 'var(--text-secondary)',
                fontSize: '1.02rem',
                lineHeight: 1.7,
              }}
            >
              Entre na sua conta para acessar o banco de dados.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => setLoginModalOpen(true)}
              sx={{
                mt: 0.5,
                px: 4,
                py: 1.4,
                borderRadius: 999,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'none',
                background:
                  'linear-gradient(135deg, rgba(111, 45, 168, 0.95) 0%, rgba(0, 217, 255, 0.8) 100%)',
                boxShadow: '0 12px 30px rgba(111, 45, 168, 0.36)',
                color: '#f8fafc',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 18px 34px rgba(111, 45, 168, 0.42)',
                },
              }}
            >
              Acessar minha conta
            </Button>
          </Box>
        </Box>

        <LoginModal
          open={loginModalOpen}
          onClose={handleLoginModalClose}
          onSuccess={handleLoginSuccess}
          isClosing={isLoginClosing}
        />
      </>
    );
  }

  return (
    <Suspense fallback={null}>
      <Box
        className="redungeon-auth-shell"
        sx={{
          width: '100%',
          minHeight: '100dvh',
          height: '100%',
        }}
      >
        <Outlet />
      </Box>
    </Suspense>
  );
};

export default ProtectedRoute;
