import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faPlus, faSearch, faFilter, faSort, faTrash, faEdit, faMinus, 
  faBriefcase, faLaptopCode, faChartLine, faMoneyBillWave, faGift, 
  faPlusCircle, faUtensils, faCar, faHome, faBolt, faFilm, 
  faShoppingCart, faHeartbeat, faGraduationCap, faEllipsisH, faChevronDown,
  faTimes, faPlane, faBus, faTrain, faTaxi, faBicycle, faWalking,
  faShower, faToilet, faBath, faBed, faCouch, faChair,
  faUserMd, faStethoscope, faPills, faHospital, faClinicMedical,
  faBook, faSchool, faUniversity, faChalkboardTeacher,
  faShoppingBag, faStore, faTshirt, faSocks, faGlasses,
  faGamepad, faTv, faMusic, faTicketAlt, faTheaterMasks,
  faLightbulb, faWater, faGasPump, faFan, faTemperatureHigh,
  faHamburger, faPizzaSlice, faIceCream, faCoffee, faBeer,
  faWineGlassAlt, faCocktail, faGlassMartiniAlt, faFileInvoiceDollar,
  faFileInvoice, faMoneyBill, faCreditCard, faWallet
} from '@fortawesome/free-solid-svg-icons';

// Add all icons to the library
library.add(
  faPlus, faSearch, faFilter, faSort, faTrash, faEdit, faMinus,
  faBriefcase, faLaptopCode, faChartLine, faMoneyBillWave, faGift,
  faPlusCircle, faUtensils, faCar, faHome, faBolt, faFilm,
  faShoppingCart, faHeartbeat, faGraduationCap, faEllipsisH, faChevronDown,
  faTimes, faPlane, faBus, faTrain, faTaxi, faBicycle, faWalking,
  faShower, faToilet, faBath, faBed, faCouch, faChair,
  faUserMd, faStethoscope, faPills, faHospital, faClinicMedical,
  faBook, faSchool, faUniversity, faChalkboardTeacher,
  faShoppingBag, faStore, faTshirt, faSocks, faGlasses,
  faGamepad, faTv, faMusic, faTicketAlt, faTheaterMasks,
  faLightbulb, faWater, faGasPump, faFan, faTemperatureHigh,
  faHamburger, faPizzaSlice, faIceCream, faCoffee, faBeer,
  faWineGlassAlt, faCocktail, faGlassMartiniAlt, faFileInvoiceDollar,
  faFileInvoice, faMoneyBill, faCreditCard, faWallet
);

// Set the base URL for axios
axios.defaults.baseURL = 'http://localhost:5000';

// Add axios interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 