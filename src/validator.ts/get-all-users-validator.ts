import { checkSchema } from "express-validator";

export default checkSchema(
  {
    currentPage: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);

          return Number.isNaN(parsedValue) ? 1 : parsedValue;
        },
      },
    },

    q: {
      trim: true,
      customSanitizer: {
        options: (value) => {
          return value ? value : "";
        },
      },
    },
    role: {
      customSanitizer: {
        options: (value) => {
          return value ? value : "";
        },
      },
    },

    perPage: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);

          return Number.isNaN(parsedValue) ? 2 : parsedValue;
        },
      },
    },
  },
  ["query"],
);
