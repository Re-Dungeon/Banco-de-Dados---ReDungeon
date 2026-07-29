import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from 'components/Sidebar/Sidebar';
import Header from 'components/Header/Header';
import { AppContainer, MainWrapper, ContentWrapper } from './styles';

const Layout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AppContainer className="redungeon-container">
      <Sidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <MainWrapper className="redungeon-main" id="redungeon-main">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <ContentWrapper className="redungeon-content" id="redungeon-content">
          <Outlet />
        </ContentWrapper>
      </MainWrapper>
    </AppContainer>
  );
};

export default Layout;
