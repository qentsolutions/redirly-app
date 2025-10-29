import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { buildShortUrl } from '@/lib/links'
import { db } from '@/lib/prisma'
import Link from 'next/link'

/**
 * Page de debug pour voir tous les liens créés
 * Accessible à /debug/links (à supprimer en production)
 */

export default async function DebugLinksPage() {
    const links = await db.link.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 50,
        include: {
            _count: {
                select: {
                    clicks: true,
                },
            },
        },
    })

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">🐛 Debug - Tous les liens</CardTitle>
                        <p className="text-sm text-gray-600 mt-2">
                            Page de debug pour voir tous les liens créés et tester les redirections
                        </p>
                    </CardHeader>
                    <CardContent>
                        {links.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                Aucun lien n'a encore été créé
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {links.map((link) => {
                                    const shortUrl = buildShortUrl(link.shortCode, link.customDomain)
                                    return (
                                        <div
                                            key={link.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{link.name}</h3>
                                                    <div className="mt-2 space-y-1 text-sm">
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Short Code:</span>{' '}
                                                            <code className="bg-yellow-100 px-2 py-1 rounded text-xs">
                                                                {link.shortCode}
                                                            </code>
                                                            <span className="text-gray-500 ml-2">
                                                                (longueur: {link.shortCode.length})
                                                            </span>
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Lien court:</span>{' '}
                                                            <a
                                                                href={shortUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {shortUrl}
                                                            </a>
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Destination:</span>{' '}
                                                            <span className="text-gray-500 truncate max-w-md inline-block">
                                                                {link.originalUrl}
                                                            </span>
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Status:</span>{' '}
                                                            <span
                                                                className={`inline-flex px-2 py-1 rounded text-xs ${link.isActive
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                    }`}
                                                            >
                                                                {link.isActive ? 'Actif' : 'Inactif'}
                                                            </span>
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Clics:</span> {link._count.clicks}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex flex-col gap-2">
                                                    <a
                                                        href={shortUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm text-center"
                                                    >
                                                        Tester →
                                                    </a>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(shortUrl)
                                                            alert('Lien copié !')
                                                        }}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                                                    >
                                                        Copier
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-900 mb-2">💡 Comment ça marche</h4>
                            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                                <li>Cliquez sur "Tester" pour visiter le lien court</li>
                                <li>
                                    Le middleware détecte le shortCode (7 caractères alphanumériques)
                                </li>
                                <li>La route [shortCode]/route.ts intercepte la requête</li>
                                <li>Le lien est trouvé dans la base de données</li>
                                <li>Un clic est enregistré (IP hashée, user-agent, etc.)</li>
                                <li>Une redirection 302 est effectuée vers l'URL originale</li>
                            </ol>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">🔍 Debugging</h4>
                            <p className="text-sm text-blue-800">
                                Si vous obtenez une 404, vérifiez que :
                            </p>
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside mt-2">
                                <li>Le shortCode fait exactement 7 caractères</li>
                                <li>Le lien est marqué comme "Actif"</li>
                                <li>Le fichier src/app/[shortCode]/route.ts existe</li>
                                <li>Le middleware laisse passer le shortCode</li>
                                <li>Regardez les logs du serveur (terminal où `npm run dev` tourne)</li>
                            </ul>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                href="/dashboard"
                                className="text-blue-600 hover:text-blue-700 text-sm underline"
                            >
                                ← Retour au dashboard
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}