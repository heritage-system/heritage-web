import { Layout } from 'antd';
import Header from './Header';
import Footer from './Footer';
import styled from 'styled-components';
import React, { useState } from 'react';

const { Content } = Layout;

const StyledContent = styled(Content)`
  min-height: calc(100vh - 64px - 200px);
`;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Layout>
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <StyledContent>{children}</StyledContent>
      <Footer />
    </Layout>
  );
};

export default MainLayout;
