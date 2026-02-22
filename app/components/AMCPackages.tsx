import React from 'react';

export default function AMCPackages() {
    const packages = [
        {
            title: 'Plumbing AMC Packages',
            image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500',
        },
        {
            title: 'Electrical AMC Package',
            image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500',
        },
        {
            title: 'Computer AMC Packages',
            image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500',
        },
        {
            title: 'AC Maintenance AMC',
            image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500',
        },
        {
            title: 'Home Appliance AMC',
            image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500',
        },
    ];

    return (
        <section className="bg-gray-50 w-full py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-[#1A2B3C] mb-8">AMC Packages</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg, index) => (
                        <div key={index} className="group cursor-pointer">
                            <div className="overflow-hidden rounded-2xl mb-4 aspect-video">
                                <img
                                    src={pkg.image}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    alt={pkg.title}
                                />
                            </div>
                            <p className="text-center font-bold text-slate-800 text-lg">{pkg.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
