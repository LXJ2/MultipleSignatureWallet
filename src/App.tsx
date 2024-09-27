

import Header from "./components/ui/header";
import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';
//import GlobalStyle from './styles/globalStyles';
import "./App.css";
import Sider from "./components/ui/menu";

function App() {

  return (
    <>
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

    </>
  );
}

export default App;
