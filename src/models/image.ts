import mongoose, { Document, Schema } from 'mongoose';

interface IImage extends Document {
  url: string;
  description?: string;
  uploadedBy?: mongoose.Schema.Types.ObjectId;
  uploadedAt?: Date;
  category: 'etc.';
  relatedIds?: [mongoose.Schema.Types.ObjectId];
  tags?: string[];
}

const imageSchema: Schema = new Schema({
  url: { type: String, required: true },
  description: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // 이미지를 업로드한 사용자
  uploadedAt: { type: Date, default: Date.now },
  category: { type: String, enum: ['etc.'], required: true }, // 이미지 유형
  relatedIds: [{ type: Schema.Types.ObjectId }], // 관련된 엔티티 (체육관, 사용자, 상품 등)
  tags: [String]
});

const Image = mongoose.models.Image || mongoose.model<IImage>('Image', imageSchema);

export default Image;