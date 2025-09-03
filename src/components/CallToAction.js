import React from "react";
import "./CallToAction.css";
import { Link } from "react-router-dom";

import { useShopContext } from "../context/ShopContext"; // Import ShopContext for region check

function CallToAction() {
  const { shopRegion } = useShopContext(); // Use shop context to get the current region

  return (
    <>
      <section className="call-to-action">
        <h2>Ready to Taste the Best Honey on Earth?</h2>
        <Link to="/honeyCollection" className="cta-btn">
          Shop Now
        </Link>
      </section>
      <div className="kashrut-box">
        {shopRegion === "US" && (
          <>
            <p className="us-kashrut-disclaimer">** Note for US Customers **</p>
            <p className="us-kashrut-disclaimer">
              All honey jars on the US site are imported from Israel and are
              under the same hashgacha as the Israel site (Vaad Hakashrus Rabbi
              Shmuel Weiner). The gift packages that are listed on the US site
              are not included under this hashgacha. Each gift package on the US
              site lists the hashgacha of the items included in the package.
              Please review this carefully before ordering to make sure it meets
              your standards of kashrus.
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default CallToAction;
