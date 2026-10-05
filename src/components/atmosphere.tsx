/** Fixed atmospheric backdrop: pre-dawn gradients plus a faint khatam lattice. */
export function Atmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="atmosphere-base absolute inset-0" />
      <div className="lattice absolute inset-0" />
    </div>
  );
}
