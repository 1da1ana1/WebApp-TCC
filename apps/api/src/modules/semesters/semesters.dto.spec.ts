import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildValidationPipe } from '../../common/validation';
import { CreateSemesterDto } from './dto/create-semester.dto';

/**
 * Guarda contra a falha silenciosa que já aconteceu: o ValidationPipe global
 * roda com `whitelist: true`, então uma data presente no schema do Prisma mas
 * ausente do CreateSemesterDto é removida do body sem erro — o POST responde
 * 201, a coordenação vê "Cronograma salvo!" e a data nunca chega às telas.
 *
 * A lista esperada é derivada do próprio schema.prisma, e não escrita à mão:
 * assim, acrescentar uma data ao model faz este teste falhar até o DTO
 * acompanhar, em vez de o campo sumir em produção.
 */
describe('CreateSemesterDto — whitelist do ValidationPipe', () => {
	const schemaDateFields = (): string[] => {
		const schema = readFileSync(
			join(__dirname, '..', '..', '..', 'prisma', 'schema.prisma'),
			'utf8',
		);
		const model = /model Semester \{([\s\S]*?)\n\}/.exec(schema);
		if (!model) throw new Error('model Semester não encontrado em schema.prisma');

		return model[1]
			.split('\n')
			.map((line) => /^\s*(\w+)\s+DateTime\??/.exec(line))
			.filter((m): m is RegExpExecArray => m !== null)
			.map((m) => m[1]);
	};

	const isoFor = (index: number) =>
		`2031-${String((index % 12) + 1).padStart(2, '0')}-15T00:00:00.000Z`;

	it('não descarta nenhuma data do cronograma ao validar o body', async () => {
		const fields = schemaDateFields();
		// Sanidade: se a regex parar de casar, o teste passaria vazio e não
		// protegeria nada.
		expect(fields).toContain('vacancyDefStartDate');
		expect(fields.length).toBeGreaterThanOrEqual(13);

		const pipe = buildValidationPipe();

		const payload: Record<string, unknown> = {
			year: 2031,
			period: '1',
			isActive: true,
		};
		fields.forEach((field, i) => {
			payload[field] = isoFor(i);
		});

		const result = (await pipe.transform(payload, {
			type: 'body',
			metatype: CreateSemesterDto,
		})) as Record<string, unknown>;

		const removidas = fields.filter((field) => result[field] === undefined);

		expect(removidas).toEqual([]);
		expect(Object.keys(result).sort()).toEqual(
			[...fields, 'year', 'period', 'isActive'].sort(),
		);
	});

	it('rejeita data em formato inválido', async () => {
		const pipe = buildValidationPipe();
		await expect(
			pipe.transform(
				{ year: 2031, period: '1', vacancyDefStartDate: 'nao-e-data' },
				{ type: 'body', metatype: CreateSemesterDto },
			),
		).rejects.toThrow();
	});
});
