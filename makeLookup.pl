#!/usr/bin/perl
use Data::Dumper;
use JSON::XS;

$file = $ARGV[0];

if(!-e $file){
	print "ERROR: No lookup CSV provided.\n";
	exit;
}

$coder = JSON::XS->new->utf8->pretty()->canonical(1);

$msoas;
$pcds;

open(FILE,$ARGV[0]);
while($line = <FILE>){
	$line =~ s/[\n\r\"]//g;
	@cols = split(/,/,$line);
#	@cols = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
	$pcd = $cols[2];
	$msoa = $cols[8];
	if($msoa){
		if($pcd =~ /^([^\s]+)\s/){
			$pcd = $1;

			if(!$msoas->{$msoa}){ $msoas->{$msoa} = {}; }
			if(!$msoas->{$msoa}{$pcd}){ $msoas->{$msoa}{$pcd} = 0; }
			$msoas->{$msoa}{$pcd}++;
			
			if(!$pcds->{$pcd}){ $pcds->{$pcd} = {}; }
			if(!$pcds->{$pcd}{$msoa}){ $pcds->{$pcd}{$msoa} = 0; }
			$pcds->{$pcd}{$msoa}++;
		}
	}
}
close(FILE);

#print Dumper %msoas;
makeCSV("lookup-msoa.json",$msoas);
makeCSV("lookup-pcd.json",$pcds);



sub makeCSV {
	my $file = $_[0];
	my $data = $_[1];

	my $csv;

	$csv = $coder->encode($data);

	$csv =~ s/ : /:/g;
	$csv =~ s/   /\t/g;
	$csv =~ s/\n\t\t//g;
	$csv =~ s/\n\t\}/\}/g;

	open(FILE,">",$file);
	print FILE $csv;
	close(FILE);
}