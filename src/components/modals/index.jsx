import LinkedInConnectModal from "./LinkedInConnectModal";
import PostSummitSummaryModal from "./PostSummitSummaryModal";
import SurveyModal from "./SurveyModal";
import EventSummaryModal from "./EventSummaryModal";
import NewEventModal from "./NewEventModal";
import InviteModal from "./InviteModal";
import PermissionsModal from "./PermissionsModal";
import ConnectionsModal from "./ConnectionsModal";
import PersonModal from "./PersonModal";
import QrScanModal from "./QrScanModal";
import DirectMessageModal from "./DirectMessageModal";
import EventDetailModal from "./EventDetailModal";
import AvatarModal from "./AvatarModal";
import VideoModal from "./VideoModal";
import LegalModal from "./LegalModal";
import ConsentLogModal from "./ConsentLogModal";

/**
 * Todos los diálogos de la app. Están en el DOM desde el inicio (ocultos) y el motor los abre/cierra.
 */
export default function Modals() {
  return (
    <>
      <LinkedInConnectModal />
      <PostSummitSummaryModal />
      <SurveyModal />
      <EventSummaryModal />
      <NewEventModal />
      <InviteModal />
      <PermissionsModal />
      <ConnectionsModal />
      <PersonModal />
      <QrScanModal />
      <DirectMessageModal />
      <EventDetailModal />
      <AvatarModal />
      <VideoModal />
      <LegalModal />
      <ConsentLogModal />
    </>
  );
}
