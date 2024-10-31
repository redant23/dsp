import mongoose from 'mongoose';

export interface IUserStock extends Document {
  user: mongoose.Types.ObjectId | object;
  stock: mongoose.Types.ObjectId | object;
  status: '보유예정' | '보유중' | '매도';
  purchaseDate?: Date;
  sellDate?: Date;
  quantity: number;
  updatedAt: Date;
}

const userStockSchema = new mongoose.Schema<IUserStock>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  status: { 
    type: String, 
    enum: ['보유예정', '보유중', '매도'],
    required: true 
  },
  purchaseDate: { 
    type: Date,
    required: function() {
      return this.status === '보유중';
    }
  },
  sellDate: { 
    type: Date,
    required: function() {
      return this.status === '매도';
    }
  },
  quantity: { type: Number, min: 1, default: 1 },
  updatedAt: { type: Date, default: Date.now }
});

// 복합 인덱스 생성
userStockSchema.index({ user: 1, stock: 1 }, { unique: true });

export const UserStock = mongoose.models.UserStock || mongoose.model('UserStock', userStockSchema); 