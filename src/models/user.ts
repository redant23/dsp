import mongoose, { Document, Schema } from 'mongoose';

const cellPhoneOnlyRegex = /^01\d-\d{4}-\d{4}$/; // 폰번호만 허용

interface IUser extends Document {
  email: string;
  nickname: string;
  passwordHash: string;
  profile?: {
    image?: string;
    phone?: string;
    address?: string;
  };
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };
  payments?: mongoose.Types.ObjectId[];
  subscriptions?: mongoose.Types.ObjectId[];
  settings?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    preferences?: Record<string, unknown>;
  };
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

const userSchema = new Schema<IUser>({
  nickname: { type: String },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profile: {
    image: { type: String },
    phone: { type: String, unique: true, match: [cellPhoneOnlyRegex, 'Please fill a valid phone number'] },
    address: { type: String },
  },
  bankDetails: { // 블록암호화 필요
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolder: { type: String }
  },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }],
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    preferences: { type: Schema.Types.Mixed }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date }
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
