"use client";

import React from 'react';
import { PricingTable, SubscribedUserBanner } from '@clerk/nextjs';

const SubscriptionsPage = () => {
    return (
        <main className="clerk-subscriptions">
            <h1 className="page-title">Choose a Plan</h1>
            <p className="page-description">
                Pick the tier that best matches your needs. You can upgrade or downgrade at any time.
            </p>
            <div className="clerk-pricing-table-wrapper">
                <PricingTable
                    tierDescriptions={{
                        standard: "Upload up to 10 books and 100 sessions a month",
                        pro: "Unlimited sessions and 100 books, with 1‑hour sessions",
                    }}
                >
                    {/* If the user is already subscribed this banner will show above the table */}
                    <SubscribedUserBanner type="dismissible" />
                </PricingTable>
            </div>
        </main>
    );
};

export default SubscriptionsPage;
