

import Header from "./components/ui/header";
import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';
//import GlobalStyle from './styles/globalStyles';
import "./App.css";
import Sider from "./components/ui/menu";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const queryClient = new QueryClient();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header></Header>
          <div>
            <div id="leftMenu">
              <Sider></Sider>
            </div>
            <div id="rightWrap">
              <Routes />
            </div>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;
