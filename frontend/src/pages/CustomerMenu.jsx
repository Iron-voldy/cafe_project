// public customer-facing menu browsing page
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaSearch, FaFilter, FaCoffee } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import API from '../services/api';

const CustomerMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await API.get('/menu/items?available=true');
                setMenuItems(res.data);
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        fetchMenu();
    }, []);

    const categories = ['all', 'beverage', 'appetizer', 'main_course', 'dessert', 'snack', 'special'];
    const filtered = menuItems.filter(i =>
        (category === 'all' || i.category === category) &&
        i.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
            <Navbar />

            {/* header */}
            <section className="bg-gradient-to-br from-amber-900 to-amber-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white mb-2">Our Menu</motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-amber-200/80 text-sm">Discover our handcrafted beverages and delicious meals</motion.p>
                </div>
            </section>

            {/* search & filter */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 w-full">
                <div className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..."
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(c => (
                            <button key={c} onClick={() => setCategory(c)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${category === c ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {c === 'all' ? 'All' : c.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* menu grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
                {loading ? (
                    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-3 border-amber-600 border-t-transparent" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <FaCoffee className="text-4xl text-amber-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Items Found</h3>
                        <p className="text-sm text-gray-500">Try a different search or category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((item, i) => (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden hover:shadow-md transition-shadow">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                                ) : (
                                    <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                        <FaBookOpen className="text-amber-400 text-3xl" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full capitalize font-medium">{item.category?.replace('_', ' ')}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description || 'A delicious choice from our kitchen'}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-amber-700">LKR {parseFloat(item.price).toFixed(2)}</span>
                                        {item.preparationTime && (
                                            <span className="text-[10px] text-gray-400">{item.preparationTime} min</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default CustomerMenu;
