import React, { useRef, useState } from 'react';
import { 
  X, 
  FileDown, 
  Share2, 
  Check, 
  Download, 
  Sparkles, 
  Loader2,
  FileText,
  Layers
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BasketballGame } from '../types/basketball';
import { SupportedLanguage, translations } from '../i18n/translations';
import { SwagIQBrand } from './SwagIQBrand';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: BasketballGame;
  currentLanguage?: SupportedLanguage;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  game,
  currentLanguage = 'it'
}) => {
  const t = translations[currentLanguage] || translations.it;
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [exportMode, setExportMode] = useState<'quick' | 'full'>('quick');

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#090d16'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SwagIQ_Scouting_${game.homeTeam.shortName}_vs_${game.awayTeam.shortName}_${exportMode === 'full' ? 'FULL' : 'QUICK'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Quick stats vs Full stats computation
  const displayedPlayers = exportMode === 'quick' ? game.players.slice(0, 6) : game.players;
  const homeTactics = game.tactics.filter(t => (t as any).team === 'home' || !(t as any).team);
  const awayTactics = game.tactics.filter(t => (t as any).team === 'away');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{t.pdfExportModalTitle}</h3>
              <p className="text-xs text-slate-400">
                {t.pdfExportModalDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyShareLink}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-orange-400" />}
              <span>{isCopied ? t.shareCopied : t.shareBtn}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isGenerating ? t.pdfGenerating : `${t.pdfDownloadBtn} (${exportMode === 'full' ? 'Full' : 'Quick'})`}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold flex-shrink-0">
          <button
            onClick={() => setExportMode('quick')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${
              exportMode === 'quick' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.pdfExportQuickTab}</span>
          </button>

          <button
            onClick={() => setExportMode('full')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${
              exportMode === 'full' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.pdfExportFullTab}</span>
          </button>
        </div>

        {/* PDF Printable Preview Document */}
        <div className="flex-1 overflow-y-auto pr-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div
            ref={reportRef}
            className="bg-[#090d16] border border-slate-800 p-8 rounded-2xl text-slate-200 space-y-6 max-w-3xl mx-auto shadow-2xl font-sans"
          >
            {/* Header Document */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <SwagIQBrand size="lg" />
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {exportMode === 'full' ? 'FULL DOSSIER v0.1' : 'EXECUTIVE REPORT v0.1'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white mt-1">
                  {exportMode === 'full' ? t.pdfExportFullTab : t.pdfExportQuickTab}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {t.pdfDate}: {game.date} • {t.pdfCompetition}: {game.competition}
                </p>
              </div>

              {/* Match Score Chip */}
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                <div className="text-xs text-slate-400 font-bold uppercase">{t.pdfFinalScore}</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  <span className="text-emerald-400">{game.homeTeam.shortName} {game.homeTeam.score}</span>
                  <span className="text-slate-600 mx-1.5">-</span>
                  <span className="text-cyan-400">{game.awayTeam.score} {game.awayTeam.shortName}</span>
                </div>
              </div>
            </div>

            {/* Team Comparison Grid */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                {t.pdfSectionTeamComparison}
              </h2>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t.pdfPossessionPct}</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">{game.homeTeam.possessionPct}%</span>
                  <span className="text-[10px] text-slate-500 block">vs {game.awayTeam.possessionPct}%</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t.pdfPassesCompleted}</span>
                  <span className="font-mono font-bold text-sm text-white">{game.homeTeam.passesCompleted}</span>
                  <span className="text-[10px] text-emerald-400 block">{game.homeTeam.passingAccuracy}% {t.pdfPassingAccuracy}</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t.pdfTurnoversSteals}</span>
                  <span className="font-mono font-bold text-sm text-white">{game.homeTeam.turnovers} / {game.homeTeam.steals}</span>
                  <span className="text-[10px] text-slate-500 block">{game.homeTeam.shortName}</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t.pdfReboundsOffDef}</span>
                  <span className="font-mono font-bold text-sm text-white">{game.homeTeam.reb}</span>
                  <span className="text-[10px] text-cyan-400 block">{game.homeTeam.oreb} OFF / {game.homeTeam.dreb} DEF</span>
                </div>
              </div>
            </div>

            {/* Shooting Breakdown */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                {t.pdfSectionShooting}
              </h2>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t.pdfTwoPoint}</span>
                  <span className="font-mono font-bold text-emerald-400">{game.homeTeam.twoPm}/{game.homeTeam.twoPa} ({game.homeTeam.twoPct}%)</span>
                  <span className="text-[10px] text-slate-500 block">Opp: {game.awayTeam.twoPm}/{game.awayTeam.twoPa} ({game.awayTeam.twoPct}%)</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t.pdfThreePoint}</span>
                  <span className="font-mono font-bold text-cyan-400">{game.homeTeam.threePm}/{game.homeTeam.threePa} ({game.homeTeam.threePct}%)</span>
                  <span className="text-[10px] text-slate-500 block">Opp: {game.awayTeam.threePm}/{game.awayTeam.threePa} ({game.awayTeam.threePct}%)</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t.pdfFreeThrows}</span>
                  <span className="font-mono font-bold text-amber-400">{game.homeTeam.ftm}/{game.homeTeam.fta} ({game.homeTeam.ftPct}%)</span>
                  <span className="text-[10px] text-slate-500 block">Opp: {game.awayTeam.ftm}/{game.awayTeam.fta} ({game.awayTeam.ftPct}%)</span>
                </div>
              </div>
            </div>

            {/* Players Table */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                {t.pdfSectionBoxScore} {exportMode === 'full' ? t.pdfAllRosters : t.pdfTopPerformers}
              </h2>
              <table className="w-full text-xs font-mono text-left border-collapse border border-slate-800 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                    <th className="p-2">{t.pdfPlayer}</th>
                    <th className="p-2 text-center">MIN</th>
                    <th className="p-2 text-center">PTS</th>
                    <th className="p-2 text-center">FG</th>
                    <th className="p-2 text-center">3PT</th>
                    <th className="p-2 text-center">REB</th>
                    <th className="p-2 text-center">AST</th>
                    <th className="p-2 text-center">+/-</th>
                    <th className="p-2 text-center">PIR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {displayedPlayers.map((p) => (
                    <tr key={p.id} className="bg-slate-950/60">
                      <td className="p-2 font-sans font-bold text-white">
                        #{p.number} {p.name} ({p.teamId === 'home' ? game.homeTeam.shortName : game.awayTeam.shortName})
                      </td>
                      <td className="p-2 text-center">{p.minutes}</td>
                      <td className="p-2 text-center font-bold text-orange-400">{p.points}</td>
                      <td className="p-2 text-center">{p.fgm}/{p.fga}</td>
                      <td className="p-2 text-center">{p.threePm}/{p.threePa}</td>
                      <td className="p-2 text-center">{p.reb}</td>
                      <td className="p-2 text-center">{p.ast}</td>
                      <td className={`p-2 text-center ${p.plusMinus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus}
                      </td>
                      <td className="p-2 text-center font-bold text-amber-400">{p.pir}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tactical Schemes Section */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                {t.pdfSectionTactics}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Home Team Tactics */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-400 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                    {game.homeTeam.name}
                  </div>
                  {homeTactics.map((tac) => (
                    <div key={tac.id} className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="flex justify-between font-bold text-white">
                        <span>{tac.name}</span>
                        <span className="text-orange-400 font-mono">{tac.pointsPerPossession} PPP</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {t.pdfExecutedTimes} {tac.frequencyCount} {t.pdfTimes} ({tac.frequencyPct}%) • {t.pdfSuccess}: {tac.successRate}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Away Team Tactics */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-cyan-400 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 mr-1.5" />
                    {game.awayTeam.name}
                  </div>
                  {awayTactics.length > 0 ? (
                    awayTactics.map((tac) => (
                      <div key={tac.id} className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div className="flex justify-between font-bold text-white">
                          <span>{tac.name}</span>
                          <span className="text-orange-400 font-mono">{tac.pointsPerPossession} PPP</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {t.pdfExecutedTimes} {tac.frequencyCount} {t.pdfTimes} ({tac.frequencyPct}%) • {t.pdfSuccess}: {tac.successRate}%
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-400">
                      Pick & Roll & Motion Offense ({game.awayTeam.shortName})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tactical Notes */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <h3 className="font-bold text-white flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                {t.pdfTacticalNotes}
              </h3>
              <ul className="text-slate-300 leading-relaxed text-[11px] space-y-1 list-disc list-inside">
                {game.coachNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span>{t.pdfGeneratedBy}</span>
                <SwagIQBrand size="xs" />
              </span>
              <span>ID: SIQ-{game.id.toUpperCase()}-{(exportMode === 'full' ? 'FULL' : 'QCK')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
