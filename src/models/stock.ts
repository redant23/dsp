import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  sector: String,
  price: { type: Number, required: true },
  dividendPerShare: Number,
  dividendYield: Number,
  lastYearTotalDividend: String,
  currentYearTotalDividend: String,
  paymentMonths: String,
  updatedAt: { type: Date, default: Date.now }
});

// 1주일 이상 지난 데이터는 오래된 것으로 간주
stockSchema.methods.isStale = function() {
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - this.updatedAt.getTime() > ONE_WEEK;
};

export const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema); 