import { Layout } from 'antd';
import Header from './Header';
import Footer from './Footer';
import styled from 'styled-components';
const { Content } = Layout;

const StyledContent = styled(Content)`
  min-height: calc(100vh - 64px - 200px);
`;

const MainLayout = ({ children }) => {

  return (
    <Layout>
      <Header/>
      <StyledContent>
        {children}
      </StyledContent>
      <Footer />
    </Layout>
  );
};

export default MainLayout; 