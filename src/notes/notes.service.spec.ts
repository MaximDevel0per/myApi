import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';

describe('NotesService', () => {
  let service: NotesService;
  let repository: jest.Mocked<Repository<Note>>;

  const note = {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Einkaufsliste',
    description: 'Milch',
    ownerId: 'user-1',
  } as Note;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getRepositoryToken(Note),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(NotesService);
    repository = module.get(getRepositoryToken(Note));
  });

  it('filtert die Liste immer nach ownerId', async () => {
    repository.find.mockResolvedValue([note]);

    await service.findAllForOwner('user-1');

    expect(repository.find).toHaveBeenCalledWith({
      where: { ownerId: 'user-1' },
      order: { updatedAt: 'DESC' },
    });
  });

  it('setzt beim Anlegen den ownerId aus dem Token, nicht aus dem Body', async () => {
    repository.create.mockReturnValue(note);
    repository.save.mockResolvedValue(note);

    await service.create(
      { title: 'Einkaufsliste', description: 'Milch' },
      'user-1',
    );

    expect(repository.create).toHaveBeenCalledWith({
      title: 'Einkaufsliste',
      description: 'Milch',
      ownerId: 'user-1',
    });
  });

  it('meldet eine fremde Notiz als 404, nicht als 403', async () => {
    //findOne liefert null, weil die ownerId Teil der Bedingung ist
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOneForOwner(note.id, 'user-2')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('wirft 404, wenn beim Loeschen keine Zeile betroffen war', async () => {
    repository.delete.mockResolvedValue({ affected: 0, raw: {} });

    await expect(service.remove(note.id, 'user-2')).rejects.toThrow(
      NotFoundException,
    );
  });
});
