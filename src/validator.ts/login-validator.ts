import { checkSchema } from "express-validator";

// export default [body("email").notEmpty().withMessage("email is required!")];
export default checkSchema({
  email: {
    errorMessage: "Invalid email",
    notEmpty: true,
    trim: true,
    isEmail: true,
  },
  password: {
    errorMessage: "Invalid password",
    notEmpty: true,
    trim: true,
  },
});
