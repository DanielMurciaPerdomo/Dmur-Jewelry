export const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-xs text-slate-500">
        <span>Dmur Jewelry · {new Date().getFullYear()}</span>
        <span>Todos los derechos reservados</span>
      </div>
    </footer>
  );
};

