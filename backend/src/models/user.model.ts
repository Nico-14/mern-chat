import { model, Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface UserDocument extends Document {
  username: string;
  password: string;
  friends: Types.Array<Types.ObjectId> | Types.Array<UserDocument>;
  comparePasswords: (password: string) => Promise<boolean>;
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: String,
    friends: [{ type: Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_: any, ret: any) => {
    delete ret._id;
  },
});

userSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);

  this.password = hash;

  next();
});

userSchema.methods.comparePasswords = async function (this: any, password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default model<UserDocument>('User', userSchema);
