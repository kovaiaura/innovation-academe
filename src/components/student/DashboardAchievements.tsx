import { Link } from 'react-router-dom';
import { ArrowRight, Award, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardAchievementsProps {
  badges: Array<{ id: string; name: string; description: string; icon: string }>;
  rank: number;
  achievementsPath: string;
}

export function DashboardAchievements({ badges, rank, achievementsPath }: DashboardAchievementsProps) {
  return (
    <div className="learning-achievements-grid">
      <section aria-labelledby="my-badges-title" className="learning-badge-collection">
        <div className="learning-section-heading">
          <div><p className="learning-kicker">YOUR COLLECTION</p><h2 id="my-badges-title">My badges <span className="learning-badge-count">{badges.length}</span></h2></div>
          <Button variant="ghost" size="sm" asChild><Link to={achievementsPath}>All achievements <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        {badges.length > 0 ? (
          <div className="learning-earned-badges">
            {badges.map((badge, index) => (
              <article key={badge.id} className={`learning-earned-badge learning-tone-${['gold', 'teal', 'berry', 'coral'][index % 4]}`}>
                <div className="learning-earned-badge-icon" aria-hidden="true">{badge.icon || <Award className="h-9 w-9" />}</div>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="learning-badges-empty"><Award className="h-10 w-10" /><h3>Your collection starts here</h3><p>No badges earned yet.</p></div>
        )}
      </section>
      <section aria-labelledby="my-class-rank-title" className="learning-own-rank learning-tone-teal">
        <p className="learning-kicker">YOUR CLASS</p>
        <h2 id="my-class-rank-title">My class rank</h2>
        <div className="learning-rank-medal"><Trophy className="h-8 w-8" aria-hidden="true" /><strong>{rank > 0 ? `#${rank}` : '—'}</strong></div>
        <p>{rank > 0 ? 'Your place in the class' : 'Class rank isn’t available yet'}</p>
      </section>
    </div>
  );
}