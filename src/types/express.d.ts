declare namespace Express {
  export interface Request {
    customer?: import('@prisma/client').Customer;
    pharmacist?: import('@prisma/client').Pharmacist;
  }
}
