import { Link } from "react-router-dom";

export function Anchor ({children,...props})
{
return (
    <Link to={props.to}>
      {children}
    </Link>
  );
}