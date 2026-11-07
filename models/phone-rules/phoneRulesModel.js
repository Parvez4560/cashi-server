import mongoose from 'mongoose';

const countryConfigSchema = new mongoose.Schema({
  countryName: { type: String, required: true },
  countryIso: { type: String, required: true, unique: true, uppercase: true }, // যেমন: "BD"
  dialCode: { type: String, required: true },     // যেমন: "+880"
  nationalNumberLength: { type: Number, required: true },
  placeholder: { type: String, required: true },  // যেমন: "017XXXXXXXX"
  regexPattern: { type: String, required: true }  // যেমন: "^01[3-9]\\d{8}$"
}, { timestamps: true });

const CountryConfig = mongoose.model('CountryConfig', countryConfigSchema);
export default CountryConfig;