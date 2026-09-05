import { BoardEntity } from '../entities/board.entity';
import { ColumnEntity } from '../entities/column.entity';

export interface IBoardRepository {
  findById(id: string): Promise<BoardEntity | null>;
  findByUserId(userId: string): Promise<BoardEntity[]>;
  create(board: BoardEntity): Promise<BoardEntity>;
  update(board: BoardEntity): Promise<BoardEntity>;
  delete(id: string): Promise<void>;

  // Column operations
  createColumn(column: ColumnEntity): Promise<ColumnEntity>;
  updateColumn(column: ColumnEntity): Promise<ColumnEntity>;
  deleteColumn(id: string): Promise<void>;
  findColumnById(id: string): Promise<ColumnEntity | null>;
}

export const BOARD_REPOSITORY = 'BOARD_REPOSITORY';
