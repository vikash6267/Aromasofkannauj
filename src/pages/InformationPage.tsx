import React from 'react';
import Layout from '@/components/layout/Layout';
import { useLocation } from 'react-router-dom';

const InformationPage = () => {
  const location = useLocation();
  const path = location.pathname.replace('/', '');
  
  let title = '';
  let content = '';

  switch (path) {
    case 'shipping':
      title = 'Shipping & Returns';
      content = 'Information about our shipping and return policies will be updated here soon.';
      break;
    case 'faq':
      title = 'Frequently Asked Questions';
      content = 'Our FAQ section is currently being updated. Please check back later.';
      break;
    case 'privacy':
      title = 'Privacy Policy';
      content = 'Your privacy is important to us. Our full privacy policy will be published here soon.';
      break;
    case 'terms':
      title = 'Terms & Conditions';
      content = 'Our terms and conditions of service will be detailed on this page.';
      break;
    default:
      title = 'Information';
      content = 'Page content coming soon.';
  }

  return (
    <Layout>
      <div className="container-custom py-16 min-h-[60vh]">
        <h1 className="text-3xl font-serif font-bold mb-8">{title}</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-600 text-lg leading-relaxed">{content}</p>
        </div>
      </div>
    </Layout>
  );
};

export default InformationPage;
