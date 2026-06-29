import { WealthData, Category, Transaction, Goal, Budget, Asset, Liability } from '../types';

export function getSeedData(): WealthData {
  // 1. Categories
  const categories: Category[] = [
    { id: 'cat-inc-sal', name: 'Gaji Bulanan', icon: 'Coins', color: '#22C55E', type: 'INCOME' },
    { id: 'cat-inc-fre', name: 'Side Hustle', icon: 'Briefcase', color: '#10B981', type: 'INCOME' },
    
    { id: 'cat-exp-foo', name: 'Food & Dining', icon: 'Utensils', color: '#EF4444', type: 'EXPENSE' },
    { id: 'cat-exp-cof', name: 'Kopi & Nongki', icon: 'Coffee', color: '#F59E0B', type: 'EXPENSE' },
    { id: 'cat-exp-tra', name: 'Transportasi', icon: 'Car', color: '#3B82F6', type: 'EXPENSE' },
    { id: 'cat-exp-sub', name: 'Langganan App', icon: 'Tv', color: '#8B5CF6', type: 'EXPENSE' },
    { id: 'cat-exp-ren', name: 'Sewa Kos / KPR', icon: 'Home', color: '#EC4899', type: 'EXPENSE' },
    { id: 'cat-exp-sho', name: 'Belanja & Style', icon: 'ShoppingBag', color: '#06B6D4', type: 'EXPENSE' },
    
    { id: 'cat-inv-sto', name: 'Saham (IHSG)', icon: 'TrendingUp', color: '#7C3AED', type: 'INVESTMENT' },
    { id: 'cat-inv-mut', name: 'Reksadana', icon: 'Shield', color: '#A855F7', type: 'INVESTMENT' },
    { id: 'cat-inv-cry', name: 'Kripto (BTC)', icon: 'Cpu', color: '#14B8A6', type: 'INVESTMENT' },
    { id: 'cat-inv-gol', name: 'Emas Mulia', icon: 'Award', color: '#EAB308', type: 'INVESTMENT' },
  ];

  // 2. Budgets
  const budgets: Budget[] = [
    { id: 'b-foo', category_id: 'cat-exp-foo', monthly_limit: 3000000 },
    { id: 'b-cof', category_id: 'cat-exp-cof', monthly_limit: 1000000 },
    { id: 'b-tra', category_id: 'cat-exp-tra', monthly_limit: 1500000 },
    { id: 'b-sho', category_id: 'cat-exp-sho', monthly_limit: 2000000 },
  ];

  // 3. Assets
  const assets: Asset[] = [
    { id: 'ast-1', name: 'Bank BCA Tapres', asset_type: 'CASH', value: 24500000 },
    { id: 'ast-2', name: 'Bank Jago Liquid', asset_type: 'CASH', value: 12000000 },
    { id: 'ast-3', name: 'Indo Premier (Saham)', asset_type: 'STOCK', value: 45000000 },
    { id: 'ast-4', name: 'Bibit Reksadana', asset_type: 'MUTUAL_FUND', value: 35000000 },
    { id: 'ast-5', name: 'Pintu Crypto Wallet', asset_type: 'CRYPTO', value: 18400000 },
    { id: 'ast-6', name: 'Antam 10g Gold Bar', asset_type: 'GOLD', value: 14200000 },
    { id: 'ast-7', name: 'Apartemen Serpong Apartment', asset_type: 'PROPERTY', value: 350000000 },
  ];

  // 4. Liabilities
  const liabilities: Liability[] = [
    { id: 'lia-1', name: 'KPR BTN Apartemen', amount: 120000000 },
    { id: 'lia-2', name: 'BCA Credit Card Gold', amount: 3400000 },
    { id: 'lia-3', name: 'Shopee PayLater', amount: 1200000 },
  ];

  // 5. Goals
  const goals: Goal[] = [
    { id: 'g-1', title: 'Emergency Fund (6x Expense)', target_amount: 50000000, current_amount: 36500000, target_date: '2026-12-31' },
    { id: 'g-2', title: 'MacBook Pro M4 Max 16"', target_amount: 42000000, current_amount: 28000000, target_date: '2026-09-30' },
    { id: 'g-3', title: 'S2 Magister di ITB', target_amount: 90000000, current_amount: 15000000, target_date: '2027-06-30' },
    { id: 'g-4', title: 'Rumah DP & Legal Fee', target_amount: 250000000, current_amount: 80000000, target_date: '2028-12-31' },
  ];

  // 6. Generate 12 months of daily/monthly transaction history
  const transactions: Transaction[] = [];
  const now = new Date();
  let transIdCounter = 1;

  // Generate for past 12 months
  for (let m = 11; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthStr = d.toISOString().slice(0, 7); // e.g. "2025-07"
    
    // Gaji Bulanan: Received on 25th of each month
    transactions.push({
      id: `tx-${transIdCounter++}`,
      amount: 18000000,
      notes: `Gaji Bulanan ${monthStr}`,
      transaction_date: `${monthStr}-25`,
      type: 'INCOME',
      category_id: 'cat-inc-sal',
      is_recurring: true,
      recurring_period: 'MONTHLY',
    });

    // Side Hustle: Dynamic income on 10th of some months
    if (m % 2 === 0) {
      transactions.push({
        id: `tx-${transIdCounter++}`,
        amount: Math.floor(Math.random() * 3000000) + 1500000,
        notes: `Project Freelance UI Design`,
        transaction_date: `${monthStr}-10`,
        type: 'INCOME',
        category_id: 'cat-inc-fre',
        is_recurring: false,
        recurring_period: 'NONE',
      });
    }

    // Rent: Paid on 5th of each month
    transactions.push({
      id: `tx-${transIdCounter++}`,
      amount: 2200000,
      notes: `Bayar Sewa Kos / Cicilan KPR`,
      transaction_date: `${monthStr}-05`,
      type: 'EXPENSE',
      category_id: 'cat-exp-ren',
      is_recurring: true,
      recurring_period: 'MONTHLY',
    });

    // Subscriptions: Netflix / Youtube Premium on 8th
    transactions.push({
      id: `tx-${transIdCounter++}`,
      amount: 189000,
      notes: `Netflix & Spotify Premium Family`,
      transaction_date: `${monthStr}-08`,
      type: 'EXPENSE',
      category_id: 'cat-exp-sub',
      is_recurring: true,
      recurring_period: 'MONTHLY',
    });

    // Weekly Investments (Saham & Reksadana & Emas)
    const investmentDays = ['07', '14', '21', '28'];
    investmentDays.forEach((day, index) => {
      // Stock weekly
      transactions.push({
        id: `tx-${transIdCounter++}`,
        amount: 500000,
        notes: `DCA Saham BBCA & TLKM`,
        transaction_date: `${monthStr}-${day}`,
        type: 'INVESTMENT',
        category_id: 'cat-inv-sto',
        is_recurring: true,
        recurring_period: 'MONTHLY',
      });

      // Mutual fund weekly
      transactions.push({
        id: `tx-${transIdCounter++}`,
        amount: 375000,
        notes: `Topup Reksadana Bibit`,
        transaction_date: `${monthStr}-${day}`,
        type: 'INVESTMENT',
        category_id: 'cat-inv-mut',
        is_recurring: true,
        recurring_period: 'MONTHLY',
      });
    });

    // Gold/Crypto investments occasionally
    if (m % 3 === 0) {
      transactions.push({
        id: `tx-${transIdCounter++}`,
        amount: 1000000,
        notes: `Beli Emas Antam Logam Mulia`,
        transaction_date: `${monthStr}-15`,
        type: 'INVESTMENT',
        category_id: 'cat-inv-gol',
        is_recurring: false,
        recurring_period: 'NONE',
      });
    }
    if (m % 4 === 0) {
      transactions.push({
        id: `tx-${transIdCounter++}`,
        amount: 1500000,
        notes: `DCA Bitcoin (BTC)`,
        transaction_date: `${monthStr}-18`,
        type: 'INVESTMENT',
        category_id: 'cat-inv-cry',
        is_recurring: false,
        recurring_period: 'NONE',
      });
    }

    // Daily occurrences: Food (e.g. every 2-3 days, higher amount, or semi-daily)
    for (let day = 1; day <= 28; day += 2) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const hasFood = Math.random() > 0.15;
      if (hasFood) {
        const brands = ['Gojek/Grab Food Nasi Goreng', 'KFC Paket Mantap', 'Warmindo Mie Spesial', 'Kopi Soe Makan Siang', 'Sederhana Padang Rendang', 'Shin Ramyun Indomaret'];
        const foodBrand = brands[Math.floor(Math.random() * brands.length)];
        transactions.push({
          id: `tx-${transIdCounter++}`,
          amount: Math.floor(Math.random() * 80000) + 40000,
          notes: foodBrand,
          transaction_date: `${monthStr}-${dayStr}`,
          type: 'EXPENSE',
          category_id: 'cat-exp-foo',
          is_recurring: false,
          recurring_period: 'NONE',
        });
      }

      // Coffee Runs (Nongki Starbucks / Kopi Kenangan) on every 4th day
      if (day % 4 === 1) {
        const places = ['Starbucks Coffee Americano', 'Kopi Kenangan Mantan', 'Janji Jiwa Latte', 'Fore Coffee Es Pandan', 'Gofood Chatime Hazelnut', 'Excellso Avocado Coffee'];
        const place = places[Math.floor(Math.random() * places.length)];
        transactions.push({
          id: `tx-${transIdCounter++}`,
          amount: Math.floor(Math.random() * 45000) + 25000,
          notes: place,
          transaction_date: `${monthStr}-${dayStr}`,
          type: 'EXPENSE',
          category_id: 'cat-exp-cof',
          is_recurring: false,
          recurring_period: 'NONE',
        });
      }

      // Transit (Gojek / Grab / MRT) on every 3rd day
      if (day % 3 === 0) {
        transactions.push({
          id: `tx-${transIdCounter++}`,
          amount: Math.floor(Math.random() * 35000) + 15000,
          notes: `Gojek Pulang Kantor`,
          transaction_date: `${monthStr}-${dayStr}`,
          type: 'EXPENSE',
          category_id: 'cat-exp-tra',
          is_recurring: false,
          recurring_period: 'NONE',
        });
      }

      // Lifestyle Shopping monthly
      if (day === 26) {
        transactions.push({
          id: `tx-${transIdCounter++}`,
          amount: Math.floor(Math.random() * 800000) + 300000,
          notes: `Belanja Baju Uniqlo & H&M`,
          transaction_date: `${monthStr}-${dayStr}`,
          type: 'EXPENSE',
          category_id: 'cat-exp-sho',
          is_recurring: false,
          recurring_period: 'NONE',
        });
      }
    }
  }

  // Sort transactions chronologically
  transactions.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));

  return {
    categories,
    transactions,
    goals,
    budgets,
    assets,
    liabilities,
  };
}
