import { checkSchema } from "express-validator";

// export default [body("email").notEmpty().withMessage("email is required!")];
export default checkSchema({
  email: {
    errorMessage: "Invalid username",
    notEmpty: true,
  },
});
