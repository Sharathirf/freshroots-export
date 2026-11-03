'use client';

import dynamic from 'next/dynamic';

const WatchlistDrawer = dynamic(() => import('@/components/WatchlistDrawer'), { ssr: false });
const SignInModal = dynamic(() => import('@/components/SignInModal'), { ssr: false });
const AccountModal = dynamic(() => import('@/components/AccountModal'), { ssr: false });
const EditProfileModal = dynamic(() => import('@/components/EditProfileModal'), { ssr: false });
const ManageAddressesModal = dynamic(() => import('@/components/ManageAddressesModal'), { ssr: false });
const OrderHistoryModal = dynamic(() => import('@/components/OrderHistoryModal'), { ssr: false });
const HelpModal = dynamic(() => import('@/components/HelpModal'), { ssr: false });
const PwaInstallPrompt = dynamic(() => import('@/components/PwaInstallPrompt'), { ssr: false });
const CookieConsentBanner = dynamic(() => import('@/components/CookieConsentBanner'), { ssr: false });

export default function ClientModals() {
  return (
    <>
      <WatchlistDrawer />
      <SignInModal />
      <AccountModal />
      <EditProfileModal />
      <ManageAddressesModal />
      <OrderHistoryModal />
      <HelpModal />
      <PwaInstallPrompt />
      <CookieConsentBanner />
    </>
  );
}
