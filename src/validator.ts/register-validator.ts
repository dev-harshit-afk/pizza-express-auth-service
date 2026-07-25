import { checkSchema } from "express-validator";

// export default [body("email").notEmpty().withMessage("email is required!")];
export default checkSchema({
  email: {
    errorMessage: "Invalid email",
    notEmpty: true,
    trim: true,
    isEmail: true,
  },
  firstName: {
    errorMessage: "Invalid firstName",
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: "Invalid lastName",
    notEmpty: true,
    trim: true,
  },
  password: {
    errorMessage: "Invalid password",
    notEmpty: true,
    trim: true,
    isLength: {
      options: { min: 8 },
      errorMessage: "Password should be at least 8 chars",
    },
  },
});
