import { Layout } from 'antd';
import Header from '../Layouts/Header';
import Footer from '../Layouts/Footer';
import styled from 'styled-components';
import React, { useState } from 'react';

const { Content } = Layout;
const HEADER_H = 65;
const StyledContent = styled(Content)`
  padding-top: ${HEADER_H}px;                 /* chừa chỗ cho header fixed */
  min-height: calc(100vh - ${HEADER_H}px - 200px);
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
