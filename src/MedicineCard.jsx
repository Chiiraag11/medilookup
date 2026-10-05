import { memo } from "react";
import { Link } from "react-router-dom";


export const first = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : "");
export const joined = (arr) => (Array.isArray(arr) ? arr.join(", ") : "");


const MedicineCard = memo(function MedicineCard({ item }) {
  const o = item.openfda || {};
  const name = first(o.brand_name) || "Unnamed medicine";
  const generic = joined(o.generic_name);
  const maker = first(o.manufacturer_name);

  return (
    <Link to={`/medicine/${item.id}`} className="card">
      <div className="card-top">
        <div className="avatar">{name[0].toUpperCase()}</div>
        <div>
          <h2>{name}</h2>
          {generic && <p className="generic">{generic}</p>}
        </div>
      </div>

      <div className="chips">
        {first(o.product_type) && <span className="chip">{first(o.product_type)}</span>}
        {(o.route || []).map((r) => (
          <span key={r} className="chip green">
            {r}
          </span>
        ))}
      </div>

      {maker && <p className="maker">by {maker}</p>}
    </Link>
  );
});

export default MedicineCard;