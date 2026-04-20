import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { LocaleProvider } from './context/LocaleContext';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </Provider>
  </StrictMode>,
);
