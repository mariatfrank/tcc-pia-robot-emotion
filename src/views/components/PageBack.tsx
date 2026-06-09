import { Link } from "react-router-dom";
import { IconChevronLeft } from "./ActionIcons";

type PageBackProps = {
  to: string;
  label?: string;
};

export function PageBack({ to, label = "Voltar" }: PageBackProps) {
  return (
    <Link to={to} className="btn btn-secondary page-back-in-card">
      <IconChevronLeft size={20} />
      {label}
    </Link>
  );
}
