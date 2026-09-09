import type { WorkspaceMember } from "../models/WorkspaceMember.js";
import type { Board } from "../models/Board.js";
import type { BoardRole } from "@endlessbacklog/shared";

// The correct augmentation point is the global `Express` namespace (the same
// one @types/passport itself augments for `req.user`), since
// express-serve-static-core's `Request<P,...>` extends `Express.Request`,
// not the other way around — augmenting `express-serve-static-core` directly
// does not propagate to `express`'s own re-exported `Request` type.
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }

    interface Request {
      workspaceMembership?: WorkspaceMember;
      board?: Board;
      boardEffectiveRole?: BoardRole;
    }
  }
}

export {};
