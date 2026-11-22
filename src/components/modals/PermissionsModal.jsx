/**
 * Modal #m-perm: su contenido lo genera el motor de la app.
 */
export default function PermissionsModal() {
  return (
    <div className="modal" id="m-perm" role="dialog" aria-modal="true" aria-label="Permisos MCP" hidden>
      <div className="modal-card glass-deep perm-card" id="permBody" />
    </div>
  );
}
