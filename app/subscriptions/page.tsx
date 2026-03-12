"use client";

import React from 'react';
import { PricingTable } from '@clerk/nextjs';

const SubscriptionsPage = () => {
    return (
        <main className="clerk-subscriptions">
            <h1 className="page-title">Choose a Plan</h1>
            <p className="page-description">
                Pick the tier that best matches your needs. You can upgrade or downgrade at any time.
            </p>
            <div className="clerk-pricing-table-wrapper">
                <PricingTable />
            </div>
        </main>
    );
};

export default SubscriptionsPage;
